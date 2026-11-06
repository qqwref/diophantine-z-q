"use strict";

const assert = require("node:assert/strict"), path = require("node:path");
const {execFileSync} = require("node:child_process");
const {W, factorial} = require("../fixed-certificate-constants.js");
const {fixedDefinitions, evaluateFixed} = require("../finite-polynomial-expressions.js");
const {optimizedFixedDefinitions, auditOptimizedFixedDefinitions} = require("./constants.js");

function verifyCutoff() {
  const level = JSON.parse(execFileSync(process.execPath,
    [path.join(__dirname, "../verify-six-contact.js")], {encoding: "utf8"})).levelThree;
  assert.deepEqual(level, {ringSize: 81, unitCount: 72, normOneCount: 36,
    effectiveLevelIndexBound: 36, effectiveNormalizerIndexBound: 144});
  const F = factorial(144), J = 3n**4n * (3n**2n-1n) * (3n**4n-1n);
  assert.equal(J, 51840n);
  assert(2n < J && J < 2n**16n);
  assert(2n**829n < F && F < 2n**830n);
  assert(831n + 16n*F < 2n**834n); // log2 D_struct < 2^834
  assert(830n + 512n*F**4n < 2n**3328n); // factorial-only log2 D
  assert(2n**434n < W && W < 2n**435n && W > 100000n);
  // BMOR A=2: .06<1/16, sqrt(W)<2^218, log(W)<435<2^9.
  assert(6n*16n < 100n && 435n < 2n**9n);
  assert(2n**241n < 2n**249n); // threshold < log X
  assert(160n*(2n**249n)**2n > 2n*W); // theta error < X/(2W)
  assert(44n*W*2n**250n < 2n**691n && 691n < 2n**250n); // pi(X)>22
  assert(22n*W*2n**250n < 2n**690n);
  assert(435n + 2n**690n < 2n**691n);
  assert(2n + 10n*2n**691n < 2n**695n);
  assert(4n + 2916n*435n + 732n*2n**690n < 2n**700n);
  assert(700 < 829); // all these fixed coefficients < D
  assert(116064000000n < 2n**37n && 2210n < 2n**12n);
  assert((96n*10n**13n)**13n < 2n**1024n);
  assert(8n*2n**834n === 2n**837n);
  assert(8n*2n**3328n === 2n**3331n);

  const definitions = optimizedFixedDefinitions(), baseline = fixedDefinitions();
  auditOptimizedFixedDefinitions(definitions);
  assert.equal(evaluateFixed(definitions.F, definitions), F);
  // Small fixtures test expression semantics without evaluating the actual D.
  for (const n of [1n, 2n, 4n])
    assert.equal(evaluateFixed(definitions.D, definitions, {F: n}), 2n*n*J**(n-1n));
  for (const name of Object.keys(baseline))
    if (!["F", "D"].includes(name)) assert.deepEqual(definitions[name], baseline[name]);
  let rejected = 0;
  for (const [name, bad] of [
    ["F", baseline.F], ["F", ["factorial", ["literal", "143"]]],
    ["D", baseline.D], ["D", ["literal", "1"]],
    ["T", ["literal", "1"]], ["R", ["ref", "D"]],
    ["Hmax", ["literal", "1"]], ["cstar", ["literal", "1"]]]) {
    assert.throws(() => auditOptimizedFixedDefinitions({...definitions, [name]: bad})); rejected++;
  }
  assert.throws(() => auditOptimizedFixedDefinitions({...definitions, extra: ["ref", "F"]})); rejected++;
  return {level, splittingFieldBound: "144!", homFieldBound: "2*F*51840^(F-1)",
    factorialBits: F.toString(2).length, modulusBits: W.toString(2).length,
    symplecticGroupOrder: Number(J), bmorParameter: 2,
    cutoffTripleTowerUpperExponent: {dated: 9013, factorialOnly: 3331, structural: 837},
    constantMutationsRejected: rejected,
    scope: "Exact finite consequences of cutoff.md; geometric field arguments are not machine formalized"};
}
module.exports = {verifyCutoff};
if (require.main === module) console.log(JSON.stringify(verifyCutoff(), null, 2));
