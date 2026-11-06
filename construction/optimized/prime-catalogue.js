"use strict";

const assert = require("node:assert/strict"), {createHash} = require("node:crypto");
const {CATALOGUE_MODULUS} = require("./constants.js");
const CONTACTS = [0, -15, -20, -24, -30, -60, 1];
const mod = (a, p) => ((a % p) + p) % p;
const gcd = (a, b) => b ? gcd(b, a % b) : a;

// Complete enumeration, not probable-prime tests or a sample of classes.
// The ceiling is a search parameter; H is found from the first 22 primes
// >324 in EVERY unit class. The pinned report checks the resulting H/hash.
function verifyCatalogue() {
  const W = Number(CATALOGUE_MODULUS), ceiling = 25000000;
  assert.equal(W, 8*3*5*7*13*17);
  const composite = new Uint8Array(ceiling + 1);
  composite[0] = composite[1] = 1;
  for (let p = 2; p*p <= ceiling; p++) if (!composite[p])
    for (let n = p*p; n <= ceiling; n += p) composite[n] = 1;
  const counts = new Uint8Array(W), units = new Uint8Array(W);
  let phi = 0;
  for (let r = 0; r < W; r++) if (gcd(r, W) === 1) { units[r] = 1; phi++; }
  assert.equal(phi, 36864);
  const encoded = Buffer.alloc(4 * 22 * phi);
  let selected = 0, remaining = phi, H = 0, lastResidue = 0;
  for (let p = 325; p <= ceiling && remaining; p++) if (!composite[p]) {
    const r = p % W;
    if (units[r] && counts[r] < 22) {
      encoded.writeUInt32LE(p, 4 * selected++);
      if (++counts[r] === 22) remaining--;
      H = p; lastResidue = r;
    }
  }
  assert.equal(remaining, 0, "Not every unit class has 22 catalogue primes");
  assert.equal(selected, 22 * phi);
  for (let r = 0; r < W; r++) assert.equal(counts[r], units[r] ? 22 : 0);
  assert.equal(H, 23150593);
  assert.equal(lastResidue, 131233);
  assert(H > 22*W && H < 2**25);
  return {modulus: W, unitClasses: phi, primesPerClass: 22, floor: 324,
    size: selected, maximum: H, lastResidue,
    sha256AscendingUint32LE: createHash("sha256").update(encoded).digest("hex"),
    verification: "Complete Eratosthenes sieve and first-22 count in every unit class"};
}

function verifyResidueExceptions() {
  const cases = [];
  for (const q of [11, 19]) {
    const forbidden = new Set(CONTACTS.map(b => mod(b, q)));
    const allowed = Array.from({length: q}, (_, i) => i).filter(i => !forbidden.has(i));
    const sums = new Set();
    for (const a of allowed) for (const b of allowed) for (const c of allowed)
      sums.add((a+b+c) % q);
    assert.equal(sums.size, q);
    cases.push({prime: q, allowedSlopes: allowed, tripleSumSize: sums.size});
  }
  // Cauchy-Davenport: three sets of size >=q-14 sum to F_q for q>=23.
  assert(3*(23-14)-2 >= 23);
  // The only primes below 23 outside the modulus are 11 and 19.
  for (const q of [2, 3, 5, 7, 11, 13, 17, 19])
    assert.equal(CATALOGUE_MODULUS % BigInt(q) !== 0n, [11, 19].includes(q));
  return {exceptions: cases, cauchyDavenportThreshold: 23,
    forbiddenPerSlope: 14, retainedPrimes: [2, 3, 5, 7, 13, 17]};
}

module.exports = {verifyCatalogue, verifyResidueExceptions};
if (require.main === module)
  console.log(JSON.stringify({catalogue: verifyCatalogue(), residues: verifyResidueExceptions()}, null, 2));
