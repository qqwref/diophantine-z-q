"use strict";

const assert = require("node:assert/strict"), {createHash} = require("node:crypto");
const {CATALOGUE_MODULUS, CATALOGUE_COUNT} = require("./constants.js");
const CONTACTS = [0, -15, -20, -24, -30, -60, 1];
const mod = (a, p) => ((a % p) + p) % p;
const gcd = (a, b) => b ? gcd(b, a % b) : a;

// Complete enumeration, not probable-prime tests or a sample of classes.
// The ceiling is a search parameter; H is found from the first 45 primes
// >324 in EVERY unit class. The pinned report checks the resulting H/hash.
function verifyCatalogue() {
  const W = Number(CATALOGUE_MODULUS), count = CATALOGUE_COUNT, ceiling = 11000;
  assert.equal(W, 8*7);
  assert.equal(count, 45);
  const composite = new Uint8Array(ceiling + 1);
  composite[0] = composite[1] = 1;
  for (let p = 2; p*p <= ceiling; p++) if (!composite[p])
    for (let n = p*p; n <= ceiling; n += p) composite[n] = 1;
  const counts = new Uint8Array(W), units = new Uint8Array(W);
  let phi = 0;
  for (let r = 0; r < W; r++) if (gcd(r, W) === 1) { units[r] = 1; phi++; }
  assert.equal(phi, 24);
  const classes = Array.from({length: W}, () => []);
  const encoded = Buffer.alloc(4 * count * phi);
  let selected = 0, remaining = phi, H = 0, lastResidue = 0;
  for (let p = 325; p <= ceiling && remaining; p++) if (!composite[p]) {
    const r = p % W;
    if (units[r] && counts[r] < count) {
      encoded.writeUInt32LE(p, 4 * selected++);
      classes[r].push(p);
      if (++counts[r] === count) remaining--;
      H = p; lastResidue = r;
    }
  }
  assert.equal(remaining, 0, "Not every unit class has 45 catalogue primes");
  assert.equal(selected, count * phi);
  for (let r = 0; r < W; r++) assert.equal(counts[r], units[r] ? count : 0);
  assert.equal(H, 10321);
  assert.equal(lastResidue, 17);
  assert(H > count*W && H < 2**14);
  let reserveMinimum = count, reserveCases = 0, worstCase;
  for (let r = 0; r < W; r++) if (units[r])
    for (let a = 1; a < 5; a++) for (let b = 1; b < 13; b++) for (let c = 1; c < 17; c++) {
      const available = classes[r].filter(p => p%5 !== a && p%13 !== b && p%17 !== c).length;
      if (available < reserveMinimum) { reserveMinimum = available; worstCase = {residue: r, excluded: [a,b,c]}; }
      assert(available >= 22); reserveCases++;
    }
  assert.equal(reserveMinimum, 22);
  assert.equal(reserveCases, 24*4*12*16);
  return {modulus: W, unitClasses: phi, primesPerClass: count, floor: 324,
    size: selected, maximum: H, lastResidue,
    reservePrimes: [5,13,17], reserveMinimum, reserveCases, worstCase,
    sha256AscendingUint32LE: createHash("sha256").update(encoded).digest("hex"),
    verification: "Complete Eratosthenes sieve and first-45 count in every unit class"};
}

function verifyResidueExceptions() {
  const cases = [];
  for (const q of [5, 11, 13, 17, 19]) {
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
  // Strip valuations at 2,3,7; prechoose zero-free slopes at the other small primes.
  for (const q of [2, 3, 5, 7, 11, 13, 17, 19])
    assert.equal(![2,3,7].includes(q), [5,11,13,17,19].includes(q));
  return {exceptions: cases, cauchyDavenportThreshold: 23,
    forbiddenPerSlope: 14, valuationPrimes: [2,3,7], prescribedResiduePrimes: [2,7]};
}

module.exports = {verifyCatalogue, verifyResidueExceptions};
if (require.main === module)
  console.log(JSON.stringify({catalogue: verifyCatalogue(), residues: verifyResidueExceptions()}, null, 2));
