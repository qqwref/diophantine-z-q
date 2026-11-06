"use strict";

const assert = require("node:assert/strict"), path = require("node:path");
const {execFileSync} = require("node:child_process");
const {P0, W: oldW, primesThrough} = require("../fixed-certificate-constants.js");
const {verifyCatalogue, verifyResidueExceptions} = require("./prime-catalogue.js");
const {verifyReductionOrders} = require("./verify-reduction-orders.js");
const {P, pointMul, localDepthCondition} = require("../rational-field-arithmetic.js");
const {fixedDefinitions, evaluateFixed} = require("../finite-polynomial-expressions.js");
const {CATALOGUE_MODULUS: W, CATALOGUE_COUNT, optimizedFixedDefinitions, auditOptimizedFixedDefinitions} = require("./constants.js");

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
    assert.equal(n % centralizer.length, 0);
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
  const D = 144n, G0 = BigInt(gl2), E0 = 24n;
  assert.equal(D, 2n**4n * 3n**2n);
  assert.equal(D*G0, 2n**9n * 3n**3n * 5n);
  const breaks = {KAtTwo: 8, fiveTorsionAtThree: 4.5, betaAtTwo: 11};
  assert.equal(2*4, breaks.KAtTwo);
  assert.equal(3*3/2, breaks.fiveTorsionAtThree);
  assert.equal(breaks.KAtTwo+3, breaks.betaAtTwo);
  assert.equal(2+2*breaks.betaAtTwo, Number(E0));
  assert.equal(2+2*breaks.fiveTorsionAtThree, 11);
  const catalogue = verifyCatalogue(), residues = verifyResidueExceptions();
  const H = BigInt(catalogue.maximum), N = BigInt(catalogue.size);
  assert.equal(CATALOGUE_COUNT, 45); assert.equal(N, 1080n);
  assert(2n**434n < oldW && oldW < 2n**435n);
  assert.equal(primesThrough(324).length, 66);
  assert(P0 < H**66n && H > 324n && H > D && H < 2n**14n);
  assert(4n*D < 2n**24n);
  assert(4n*H > 20n); // Q>2^20, without a floor on R

  // The CM class number is <=D/2, inside Watkins's classification.
  // The theorem's fundamental-discriminant bound is an external input.
  assert.equal(D/2n, 72n);
  const conductorBound = 2n*(3n*72n)**2n;
  assert.equal(conductorBound, 93312n);
  assert(3000000n < 2000n**2n);
  assert(conductorBound*2000n < 3n*(100000000n-1n));
  assert(8n**20n > 200000000n*3n**20n); // e>8/3 => log(2Bcm)<20
  assert(200000000n+4096n*(1024n+144n+40n) < 210000000n);
  assert.equal(1024n*64n*6n, 393216n);
  assert.equal(1024n*(2n+2n*35n), 73728n);
  assert.equal(393216n+73728n, 466944n);
  assert(466944n < 2n**20n);

  const uniformBits = 20000000n;
  assert.equal(14n*(66n+N), 16044n);
  assert(7n+3n*(2n+10n*16044n) < uniformBits);
  assert(4n+14n*(2916n*66n+732n*N) < uniformBits); // ell, not necessarily <T
  assert(10n**1000n < 2n**3322n);
  assert(3n*3322n*((1922000n+999n)/1000n)+7n < uniformBits); // scalar constructor degrees
  assert(1344n*10n**19n < 2n**74n);
  assert.equal(156n*(24n+4n*H), 6444048n);
  assert.equal(156n*11n, 1716n);
  assert(13n*74n+6444048n+2n*1716n < 6450000n);
  assert(6450000n < uniformBits);

  const definitions = optimizedFixedDefinitions(), baseline = fixedDefinitions();
  auditOptimizedFixedDefinitions(definitions);
  for (const [name, expected] of Object.entries({W, F: D, D, G0, E0, Bcm: 100000000n, Ccm: 210000000n}))
    assert.equal(evaluateFixed(definitions[name], definitions), expected);
  const Q = evaluateFixed(definitions.Q, definitions, {Hmax: H});
  assert.equal(Q, 2n**24n * 3n**11n * 4n**(2n*H));
  assert(14000000n*Q**12n > 210000000n);
  const T = evaluateFixed(definitions.T, definitions, {Hmax: H});
  assert.equal(T, ((1344n*10n**19n)**13n * 3n**1716n) << 6444048n);
  const cutoffBits = T.toString(2).length;
  assert.equal(cutoffBits, 6447724);
  const lowerDecimal = 10n**1940958n;
  assert(lowerDecimal <= T && T < 10n*lowerDecimal);
  for (const h of [1n, 10000n, 1000000n]) {
    const expected = h > D ? h : D;
    assert.equal(evaluateFixed(definitions.R, definitions, {Hmax: h}), expected);
  }
  for (const name of Object.keys(baseline))
    if (!["W", "Hproduct", "Hmax", "F", "D", "G0", "E0", "R", "Q", "Bcm", "Ccm", "Aheight"].includes(name)) assert.deepEqual(definitions[name], baseline[name]);
  let rejected = 0;
  for (const [name, bad] of [
    ["F", baseline.F], ["F", ["factorial", ["literal", "144"]]],
    ["D", baseline.D], ["D", ["literal", "1"]],
    ["G0", ["literal", "479"]], ["E0", ["literal", "23"]], ["E0", ["literal", "866"]],
    ["W", baseline.W], ["W", ["literal", "1"]], ["Q", baseline.Q],
    ["Hproduct", baseline.Hproduct], ["Hmax", baseline.Hmax],
    ["Bcm", baseline.Bcm], ["Ccm", baseline.Ccm], ["Aheight", baseline.Aheight],
    ["T", ["literal", "1"]], ["R", ["ref", "D"]], ["R", baseline.R],
    ["R", ["max", ["ref", "D"], ["pow", ["ref", "Hmax"], ["literal", "3"]], ["pow", ["literal", "10"], ["literal", "12"]]]],
    ["Hmax", ["literal", "1"]], ["cstar", ["literal", "1"]]]) {
    assert.throws(() => auditOptimizedFixedDefinitions({...definitions, [name]: bad})); rejected++;
  }
  assert.throws(() => auditOptimizedFixedDefinitions({...definitions, extra: ["ref", "F"]})); rejected++;
  return {level, branchQuadraticDiscriminants: discriminants,
    centralizers: verifyCentralizers(), formalDepth: verifyFormalDepth(),
    splittingFieldBound: 144, homFieldBound: 144, fiveTorsionExtensionBound: gl2,
    upperBreakBounds: breaks, conductorExponentBounds: {two: 24, three: 11, other: 2},
    cm: {classNumberBound: 72, fundamentalDiscriminantBound: 3000000,
      orderConductorBound: 93312, ellipticHeightBound: 100000000, surfaceHeightBound: 210000000},
    catalogue, residues, reductionOrders: verifyReductionOrders(),
    primeSupportBound: "Hmax", heightBase: "2^24 * 3^11 * 4^(2*Hmax)",
    nonCmHeightBound: "14000000 * Q^12 * M^24",
    cutoff: {formula: "(1344*10^19)^13 * 2^6444048 * 3^1716", upperBound: "2^6450000",
      bits: cutoffBits, decimalDigits: 1940959, previousUpperBound: "2^(2^44)"},
    uniformAnalysisBound: "U=2^20000000; not T+1",
    constantMutationsRejected: rejected,
    scope: "Exact finite consequences of height-refinements.md; geometric, formal-group and prime-pattern arguments are not machine formalized"};
}
module.exports = {verifyCutoff};
if (require.main === module) console.log(JSON.stringify(verifyCutoff(), null, 2));
