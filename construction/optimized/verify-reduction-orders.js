"use strict";

const assert = require("node:assert/strict");
const mod = (a, p) => ((a % p) + p) % p;
function largestPrimeFactor(n) {
  let result = 1;
  for (let p = 2; p*p <= n; p++) while (n % p === 0) { result = p; n /= p; }
  return Math.max(result, n);
}

// Independently enumerate the actual curve over F_p or F_p[s]/(s^2-2).
// This checks the reduction-order formulas on finite fixtures, not for all p.
function verifyReductionOrders() {
  const cases = [];
  for (let p = 3; p <= 101; p += 2) {
    if (largestPrimeFactor(p) !== p) continue;
    const root = Array.from({length: p}, (_, s) => s).find(s => s*s % p === 2);
    for (const s of root === undefined ? [null] : [root, p-root]) {
      const extension = s === null, size = extension ? p*p : p;
      const encode = (a, b) => mod(a, p) + p*mod(b, p);
      const add = (x, y) => encode(x%p + y%p, Math.floor(x/p) + Math.floor(y/p));
      const neg = x => encode(-(x%p), -Math.floor(x/p));
      const mul = (x, y) => encode((x%p)*(y%p) + 2*Math.floor(x/p)*Math.floor(y/p),
        (x%p)*Math.floor(y/p) + (y%p)*Math.floor(x/p));
      const d = extension ? encode(75, -53) : mod(75-53*s, p);
      if (d === 0) {
        assert.equal(p, 7);
        cases.push({prime: p, residueDegree: 1, singularSmoothOrder: 7});
        continue;
      }
      const squares = new Set();
      for (let y = 0; y < size; y++) squares.add(mul(y, y));
      let order = 1;
      for (let x = 0; x < size; x++) {
        const rhs = add(mul(mul(x, x), x), neg(mul(mul(d, d), x)));
        order += rhs === 0 ? 1 : squares.has(rhs) ? 2 : 0;
      }
      assert.equal(order % 4, 0);
      if (extension) {
        let candidates;
        if (p % 4 === 3) candidates = [(p-1)**2, (p+1)**2];
        else {
          const a = Array.from({length: Math.floor(Math.sqrt(p))+1}, (_, i) => i)
            .find(i => Number.isInteger(Math.sqrt(p-i*i)));
          const b = Math.sqrt(p-a*a);
          candidates = [(p+1)**2-4*a*a, (p+1)**2-4*b*b];
        }
        assert(candidates.includes(order));
      } else assert((order-(p+1))**2 <= 4*p);
      const largest = largestPrimeFactor(order);
      assert(largest <= p);
      cases.push({prime: p, residueDegree: extension ? 2 : 1, order, largestPrimeFactor: largest});
    }
  }
  return {cases: cases.length, reductions: cases,
    scope: "Exact point counts through p=101; the general CM proof is in cutoff.md"};
}

module.exports = {verifyReductionOrders};
if (require.main === module) console.log(JSON.stringify(verifyReductionOrders(), null, 2));
