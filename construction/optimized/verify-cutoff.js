"use strict";

const assert = require("node:assert/strict"), path = require("node:path");
const {execFileSync} = require("node:child_process");
const {P0, W: oldW, primesThrough} = require("../fixed-certificate-constants.js");
const {verifyCatalogue, verifyResidueExceptions} = require("./prime-catalogue.js");
const {verifyReductionOrders} = require("./verify-reduction-orders.js");
const {P, pointMul, localDepthCondition} = require("../rational-field-arithmetic.js");
const {fixedDefinitions, evaluateFixed} = require("../finite-polynomial-expressions.js");
const {CATALOGUE_MODULUS: W, optimizedFixedDefinitions, auditOptimizedFixedDefinitions} = require("./constants.js");

function permutations(n) {
  const result = [];
  function visit(prefix) {
    if (prefix.length === n) { result.push(prefix); return; }
    for (let i = 0; i < n; i++) if (!prefix.includes(i)) visit(prefix.concat(i));
  }
  visit([]); return result;
}
const compose = (a, b) => b.map(i => a[i]);
const equal = (a, b) => a.every((v, i) => v === b[i]);

function verifyCentralizers() {
  const s3 = permutations(3), cycle = [1, 2, 0], swap = [1, 0, 2];
  const regular = [cycle, swap].map(g => s3.map(h => s3.findIndex(k => equal(k, compose(g, h)))));
  const cases = [
    {name: "cyclic regular", n: 4, generators: [[1, 2, 3, 0]], expected: 4},
    {name: "symmetric nonfree", n: 3, generators: [cycle, swap], expected: 1},
    {name: "nonabelian regular", n: 6, generators: regular, expected: 6}
  ];
  return cases.map(({name, n, generators, expected}) => {
    const orbit = new Set([0]);
    for (const point of orbit) for (const g of generators) orbit.add(g[point]);
    assert.equal(orbit.size, n);
    const centralizer = permutations(n).filter(c => generators.every(g => equal(compose(c, g), compose(g, c))));
    assert.equal(centralizer.length, expected);
    assert.equal(new Set(centralizer.map(c => c[0])).size, centralizer.length);
    assert(centralizer.length <= n);
    return {name, points: n, centralizerOrder: centralizer.length};
  });
}

function verifyFormalDepth() {
  // Exact tests of the actual denominator/divisibility predicate, including
  // the ramification at two. These are fixtures, not evaluation of global M.
  const points = Array.from({length: 33}, (_, i) => pointMul(P, i-16));
  let cases = 0;
  for (const [Ns, expectedMultiplier] of [[2n, 2], [4n, 8]]) {
    points.forEach((point, i) => {
      assert.equal(localDepthCondition(point, Ns), (i-16) % expectedMultiplier === 0); cases++;
    });
  }
  return {cases, fixtures: [{Ns: 2, leastMultiplier: 2}, {Ns: 4, leastMultiplier: 8}]};
}

function verifyCutoff() {
  const level = JSON.parse(execFileSync(process.execPath,
    [path.join(__dirname, "../verify-six-contact.js")], {encoding: "utf8"})).levelThree;
  assert.deepEqual(level, {ringSize: 81, unitCount: 72, normOneCount: 36,
    effectiveLevelIndexBound: 36, effectiveNormalizerIndexBound: 144});
  const discriminants = [[1, -60, -1800], [13, 480, 3600], [11, 600, 7200]]
    .map(([a, b, c]) => b*b - 4*a*c);
  assert.deepEqual(discriminants, [10800, 43200, 43200]);
  discriminants.forEach(d => { const n = Math.floor(Math.sqrt(d)); assert(n*n < d && d < (n+1)**2); });
  assert.equal(300**2 - 4*7*3600, -10800);

  let gl2 = 0;
  for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++)
    for (let c = 0; c < 5; c++) for (let d = 0; d < 5; d++)
      if ((a*d-b*c) % 5 !== 0) gl2++;
  assert.equal(gl2, (25-1)*(25-5)); assert.equal(gl2, 480);
  const D = 144n, G0 = BigInt(gl2), U0 = 3n*D, E0 = 2n+2n*U0;
  assert(D < 2n**8n && D*G0 < 2n**17n);
  assert(2n*(1n+17n) <= U0 && 2n*(1n+8n) <= U0);
  assert.equal(U0, 432n); assert.equal(E0, 866n);
  const catalogue = verifyCatalogue(), residues = verifyResidueExceptions();
  const H = BigInt(catalogue.maximum), N = BigInt(catalogue.size);
  assert(2n**434n < oldW && oldW < 2n**435n);
  assert.equal(primesThrough(324).length, 66);
  assert(P0 < H**66n && N+66n < 22n*W);
  assert(H > 22n*W && H > D && H < 2n**25n);
  assert(4n*D < 4n**5n && 5n+H <= E0*H); // degree bound with Q=4^(R E0)
  assert(2n*E0*H > 40n && 2n**40n > 10n**12n); // Q>10^12
  assert(50000n*D**2n < 34n*E0*H); // Q^17 dominates Ccm
  const powerOfTwo = 442n*E0*H;
  assert.equal(powerOfTwo, 8861398783796n);
  assert((96n*10n**13n)**13n < 2n**1024n);
  assert(powerOfTwo+1024n < 2n**44n); // log2(T)<2^44
  assert(1n+220n*W < 230n*W);
  assert(1n+2916n*66n+732n*N < 17000n*W);
  assert(25n*17000n*W < powerOfTwo); // ell<T
  assert(25n*(690n*W+1n) < powerOfTwo); // division polynomials for cstar
  assert(60000007n < powerOfTwo); // all extra literal indices

  const definitions = optimizedFixedDefinitions(), baseline = fixedDefinitions();
  auditOptimizedFixedDefinitions(definitions);
  for (const [name, expected] of Object.entries({F: D, D, G0, E0}))
    assert.equal(evaluateFixed(definitions[name], definitions), expected);
  for (const h of [1n, 10000n, 1000000n]) {
    const expected = h > D ? h : D;
    assert.equal(evaluateFixed(definitions.R, definitions, {Hmax: h}), expected);
  }
  for (const name of Object.keys(baseline))
    if (!["W", "F", "D", "G0", "E0", "R", "Q"].includes(name)) assert.deepEqual(definitions[name], baseline[name]);
  let rejected = 0;
  for (const [name, bad] of [
    ["F", baseline.F], ["F", ["factorial", ["literal", "144"]]],
    ["D", baseline.D], ["D", ["literal", "1"]],
    ["G0", ["literal", "479"]], ["E0", ["literal", "865"]],
    ["W", baseline.W], ["W", ["literal", "1"]], ["Q", baseline.Q],
    ["T", ["literal", "1"]], ["R", ["ref", "D"]], ["R", baseline.R],
    ["R", ["max", ["ref", "D"], ["pow", ["ref", "Hmax"], ["literal", "3"]], ["pow", ["literal", "10"], ["literal", "12"]]]],
    ["Hmax", ["literal", "1"]], ["cstar", ["literal", "1"]]]) {
    assert.throws(() => auditOptimizedFixedDefinitions({...definitions, [name]: bad})); rejected++;
  }
  assert.throws(() => auditOptimizedFixedDefinitions({...definitions, extra: ["ref", "F"]})); rejected++;
  return {level, branchQuadraticDiscriminants: discriminants,
    centralizers: verifyCentralizers(), formalDepth: verifyFormalDepth(),
    splittingFieldBound: 144, homFieldBound: 144, fiveTorsionExtensionBound: gl2,
    absoluteUpperBreakBound: Number(U0), conductorExponentBound: Number(E0),
    catalogue, residues, reductionOrders: verifyReductionOrders(),
    primeSupportBound: "Hmax", heightBase: "4^(866*Hmax)",
    cutoff: {formula: "(96*10^13)^13 * 2^8861398783796", upperBound: "2^(2^44)",
      previousUpperBound: "2^(2^(2^242))"},
    constantMutationsRejected: rejected,
    scope: "Exact finite consequences of cutoff.md; geometric, formal-group and prime-pattern arguments are not machine formalized"};
}
module.exports = {verifyCutoff};
if (require.main === module) console.log(JSON.stringify(verifyCutoff(), null, 2));
