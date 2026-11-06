"use strict";

const assert = require("node:assert/strict");
const {RationalBuilder} = require("../rational-elliptic-core.js");
const {integerGuardPolynomial} = require("../rational-model-assembly.js");
const {finiteArtifact} = require("../finite-polynomial-expressions.js");
const {q, qadd, qmul, qsub, qdiv, qinv, indexCode} = require("../rational-field-arithmetic.js");
const {interpolationData, interpolationGuard, evaluateGuardParts} = require("./interpolation-guard.js");
const {buildOptimizedModel, auditOptimizedLibrary} = require("./model.js");
const {Translator} = require("./translator.js");
const {auditEvaluation, auditBundle} = require("./audit.js");
const {build} = require("./build.js");
const {verifyCutoff} = require("./verify-cutoff.js");
const {optimizedFixedDefinitions} = require("./constants.js");

const codeCache = new Map();
function code(n) {
  if (!codeCache.has(n)) codeCache.set(n, indexCode(n));
  return codeCache.get(n);
}
function evaluate(t, assignment, call) {
  const values = [];
  for (const n of t.nodes) {
    if (n.op === "const") values.push(q(n.args[0]));
    else if (n.op === "var") { assert(assignment[n.args[0]]); values.push(assignment[n.args[0]]); }
    else if (n.op === "add") values.push(qadd(...n.args.map(i => values[i])));
    else if (n.op === "mul") values.push(qmul(...n.args.map(i => values[i])));
    else if (n.op === "call") values.push(call(n.args[0], n.args.slice(1, -1).map(i => values[i])));
    else throw Error("Unexpected evaluator node " + n.op);
  }
  return values[t.root];
}

function verifyGuards() {
  let cases = 0, originalComparisons = 0, offCarrier = 0;
  const degreeNodes = [];
  for (const T of [0, 1, 2]) {
    const data = interpolationData(T);
    const b = new RationalBuilder(Array.from({length: 16}, (_, i) => "v" + i));
    const root = interpolationGuard(b, b.inputs.slice(0, 15), b.inputs[15], T);
    const t = {nodes: b.nodes, root};
    const degrees = [];
    for (const n of b.nodes) degrees.push(n.op === "var" ? 1 : n.op === "const" ? 0 :
      n.op === "add" ? Math.max(...n.args.map(i => degrees[i])) : n.args.reduce((s, i) => s + degrees[i], 0));
    assert(degrees[root] <= 12 * T + 3);
    degreeNodes.push({T, degreeBound: degrees[root], nodes: b.nodes.length});
    for (let a = -T - 1; a <= T + 1; a++) for (let c = -T - 1; c <= T + 1; c++)
      for (let d = -T - 1; d <= T + 1; d++) {
        const points = [code(a), code(c), code(d)];
        const parts = evaluateGuardParts(data, points);
        const inside = [a, c, d].every(x => Math.abs(x) <= T);
        assert.equal(parts.outside[0] === 0n, inside);
        if (inside) assert.deepEqual(parts.error, q(data.scale ** 2n * BigInt(a * c - d)));
        const inverse = parts.outside[0] === 0n ? q(0) : qinv(parts.outside);
        const actual = evaluate(t, points.flat().concat([inverse]));
        assert.equal(actual[0] === 0n, !inside || a * c === d);
        // When all points are inside, acceptance cannot depend on the witness.
        if (inside) assert.equal(evaluate(t, points.flat().concat([q(-3)]))[0] === 0n, a * c === d);
        cases++;
      }
    for (const point of [Array.from({length: 5}, (_, j) => q(j + 1, j + 2)),
      code(0).map((x, j) => j === 0 ? q(2) : x)]) {
      for (let slot = 0; slot < 3; slot++) {
        const points = [code(0), code(0), code(0)]; points[slot] = point;
        const parts = evaluateGuardParts(data, points); assert(parts.outside[0] > 0n);
        assert.equal(evaluate(t, points.flat().concat([qinv(parts.outside)]))[0], 0n); offCarrier++;
      }
    }
    // Independently evaluate the old literal product for T=0 and T=1.
    if (T <= 1) {
      const old = new RationalBuilder(Array.from({length: 15}, (_, i) => "v" + i));
      const oldRoot = integerGuardPolynomial(old, old.inputs, T).product;
      for (const labels of [[0,0,0], [0,0,1], [1,1,1], [-1,-1,1], [-1,1,1], [2,0,1]]) {
        const points = labels.map(code), oldValue = evaluate({nodes: old.nodes, root: oldRoot}, points.flat());
        const parts = evaluateGuardParts(data, points);
        assert.equal(oldValue[0] !== 0n, parts.outside[0] !== 0n || parts.error[0] === 0n);
        originalComparisons++;
      }
    }
  }
  return {cases, originalComparisons, offCarrier, degreeNodes};
}

function verifyArithmetic() {
  const library = buildOptimizedModel(), translator = new Translator(library);
  const b = new RationalBuilder(["x", "y"]), terms = b.inputs.concat([0, 1, -1, 2, 3].map(n => b.constant(n)));
  // Include both operand orders, all identity constants, and general products.
  for (const left of terms) for (const right of terms) { b.add(left, right); b.mul(left, right); }
  const source = {nodes: b.nodes, variables: b.variables, variableCount: b.variables.length, root: b.nodes.length - 1};
  const recipe = translator.translate(source, {name: "fixture", sourceInputCount: 2, naturalInputs: false,
    outputMode: "value", sourceFile: "fixture", sourceHash: "fixture"});
  const bundle = {library: finiteArtifact(library, translator.extraConstants), recipes: {fixture: recipe}};
  bundle.library.fixedConstants = optimizedFixedDefinitions(translator.extraConstants);
  auditEvaluation(bundle, recipe, source, {inputs: 2, naturalInputs: false, mode: "value"});
  let cases = 0, negateRejections = 0;
  for (const x of [-2, 0, 2]) for (const y of [-1, 0, 1]) {
    const values = [], pointLabels = new Map([[-1, 0], [-2, 1], [-3, -1], [0, x], [5, y]]);
    recipe.constantDefinitions.forEach(c => pointLabels.set(c.point, Number(bundle.library.fixedConstants[c.valueRef][1])));
    const operations = new Map(recipe.operations.map(row => [row[1], row]));
    source.nodes.forEach((n, i) => {
      values.push(n.op === "var" ? [x, y][n.args[0]] : n.op === "const" ? Number(n.args[0]) :
        n.op === "add" ? values[n.args[0]] + values[n.args[1]] : values[n.args[0]] * values[n.args[1]]);
      const row = operations.get(i);
      if (row) {
        const a = pointLabels.get(row[2]), value = row[0] === 3 ? -a :
          row[0] === 0 ? a + pointLabels.get(row[3]) : a * pointLabels.get(row[3]);
        pointLabels.set(row.at(-2), value);
      }
      assert(pointLabels.get(recipe.sourceNodePoints[i]) === values[i]); cases++;
    });
  }
  const negation = library.templates[library.id("raw_negate")];
  for (const n of [-2, -1, 0, 1, 2]) {
    const assignment = code(n).concat(code(-n));
    assert.equal(evaluate(negation, assignment)[0], 0n);
    for (let j = 5; j < 10; j++) {
      const changed = assignment.slice(); changed[j] = qadd(changed[j], q(1));
      assert.notEqual(evaluate(negation, changed)[0], 0n); negateRejections++;
    }
  }
  const reject = mutate => {
    const changed = JSON.parse(JSON.stringify(recipe)); mutate(changed);
    assert.throws(() => auditEvaluation(bundle, changed, source, {inputs: 2, naturalInputs: false, mode: "value"}));
  };
  reject(r => { r.operations.find(row => row[0] === 3)[0] = 1; });
  reject(r => { r.operations.find(row => row[0] === 0)[3] = -3; });
  reject(r => { r.rootEquality[0] = -1; });
  reject(r => { r.sourceNodePoints[0] = -1; });
  reject(r => { r.operations.push(r.operations[0]); });
  return {cases, negateRejections, mutationsRejected: 5};
}

function threeSquares(n) {
  const target = 8 * n + 3;
  for (let a = 0; a * a <= target; a++) for (let b = 0; a * a + b * b <= target; b++) {
    const c = Math.floor(Math.sqrt(target - a * a - b * b));
    if (a * a + b * b + c * c === target) return [a, b, c];
  }
  return null;
}

function verifyNatural() {
  for (let n = -100; n <= 1000; n++) assert.equal(threeSquares(n) !== null, n >= 0);
  const library = buildOptimizedModel(), t = library.templates[library.id("natural")];
  assert.equal(t.witnessCount, 105504);
  let cases = 0, changedInputsRejected = 0;
  // Verify the wrapper in the exact integer-index model. Calls to established
  // member/add/multiply predicates are contract oracles, not global proofs.
  const registry = new Map(), key = p => p.map(x => x.join("/")).join(",");
  const encode = n => { const p = code(n); registry.set(key(p), n); return p; };
  const call = (id, args) => {
    const labels = [];
    for (let i = 0; i < args.length; i += 5) labels.push(registry.get(key(args.slice(i, i + 5))));
    if (labels.some(n => n === undefined)) return q(1);
    const name = library.templates[id].name;
    if (name === "member") return q(0);
    if (name === "raw_add") return q(labels[0] + labels[1] === labels[2] ? 0 : 1);
    if (name === "multiply") return q(labels[0] * labels[1] === labels[2] ? 0 : 1);
    throw Error("Unexpected natural call");
  };
  encode(3);
  for (let n = 0; n <= 3; n++) {
    const roots = threeSquares(n), labels = {N: n, eightNplusThree: 8 * n + 3,
      partialSum: roots[0] ** 2 + roots[1] ** 2};
    roots.forEach((r, i) => { labels[`root.${i}`] = r; labels[`square.${i}`] = r * r; });
    for (let i = 0; i < 3; i++) labels[`double.${i}`] = 2 ** (i + 1) * n;
    const assignment = [];
    for (const v of t.variables) {
      if (v.name.startsWith("fixed_")) assignment[v.index] = q(...v.name.slice(6).split("/"));
      else {
        const separator = v.name.lastIndexOf("."), label = labels[v.name.slice(0, separator)];
        assert(label !== undefined); assignment[v.index] = encode(label)[Number(v.name.slice(separator + 1))];
      }
    }
    assert.equal(evaluate(t, assignment, call)[0], 0n); cases++;
    const wrong = assignment.slice(); wrong[0] = q(2);
    assert.notEqual(evaluate(t, wrong, call)[0], 0n); changedInputsRejected++;
    const fixed = t.variables.find(v => v.name.startsWith("fixed_"));
    wrong[0] = assignment[0]; wrong[fixed.index] = qadd(wrong[fixed.index], q(1));
    assert.notEqual(evaluate(t, wrong, call)[0], 0n); changedInputsRejected++;
  }
  return {integerCases: 1101, wrapperCases: cases, changedInputsRejected,
    scope: "Wrapper tests use exact contracts for the baseline arithmetic predicates"};
}

function verifyBundleMutations() {
  const {bundle, source, baseline} = build(); let rejected = 0;
  const natural = bundle.recipes.precision.sourceVariables[0], oldStart = natural[2];
  natural[2] = null; assert.throws(() => auditBundle(bundle, source, baseline)); natural[2] = oldStart; rejected++;
  const guard = bundle.library.templates.find(t => t.name === "multiply.guard");
  const node = guard.nodes.find(n => n.op === "finite_guard_interpolation"), cutoff = node.args[0];
  node.args[0] = ["literal", "1"]; assert.throws(() => auditOptimizedLibrary(bundle.library)); node.args[0] = cutoff; rejected++;
  const shift = bundle.recipes.main.calls[1].parameters[5][1];
  bundle.recipes.main.calls[1].parameters[5][1] = 0;
  assert.throws(() => auditBundle(bundle, source, baseline)); bundle.recipes.main.calls[1].parameters[5][1] = shift; rejected++;
  return {rejected};
}

function verify() {
  return {passed: true, guards: verifyGuards(), arithmetic: verifyArithmetic(),
    natural: verifyNatural(), bundleMutations: verifyBundleMutations(),
    cutoff: verifyCutoff(),
    scope: "Finite exact checks and structural negative tests; not a proof of the inherited arithmetic inputs"};
}
module.exports = {verify};
if (require.main === module) console.log(JSON.stringify(verify(), null, 2));
