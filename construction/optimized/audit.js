"use strict";

const assert = require("node:assert/strict");
const {checkCoverage, auditComposition} = require("../audit-rational-expression.js");
const {hash} = require("../rational-circuit-translator.js");
const {auditOptimizedLibrary} = require("./model.js");
const {optimizedDefinitions} = require("./translator.js");
const integer = n => Number.isSafeInteger(n) && n >= 0;

// This audit walks the pinned source, independently of translator allocation.
function auditEvaluation(bundle, recipe, source, {inputs, naturalInputs, mode}) {
  const r = recipe, ts = bundle.library.templates, table = r.operationTemplates;
  assert.equal(r.format, "model-evaluation-polynomial-recipe-v2");
  assert.equal(r.parameterCount, 5 * (inputs + (mode === "value" ? 1 : 0)));
  assert.equal(r.sourceInputCount, inputs); assert.equal(r.naturalInputs, naturalInputs);
  assert.equal(r.outputMode, mode); assert.equal(r.sourceRoot, source.root);
  assert.equal(r.sourceVariableCount, source.variableCount);
  assert.equal(r.witnessCount, r.variableCount - r.parameterCount);
  for (const [key, name] of Object.entries({natural: "natural", addition: "raw_add",
    multiplication: "multiply", negation: "raw_negate"})) assert.equal(ts[table[key]]?.name, name);
  assert.equal(ts[table.negation].witnessCount, 0);
  const power = table.power === null ? null : bundle.recipes[table.power];
  assert.equal(!!power, !!source.witnessBlocks?.length);
  if (power) assert.equal(power.name, "power_value");
  assert.equal(r.generator.length, 3); assert(r.generator.every(integer));
  const spans = r.generator.map(i => [i, 1]);
  const vars = source.variables || Array.from({length: source.variableCount}, (_, index) =>
    ({index, kind: index < inputs ? "input" : "witness"}));
  assert.equal(vars.filter(v => v.kind === "input").length, inputs);
  assert.equal(vars.length, r.sourceVariables.length);
  const varMap = new Map();
  vars.forEach((v, i) => {
    const [index, point, start] = r.sourceVariables[i];
    assert.equal(r.sourceVariables[i].length, 3); assert.equal(index, v.index);
    assert(integer(point)); assert(!varMap.has(index)); varMap.set(index, point);
    if (v.kind === "input") { assert(index < inputs); assert.equal(point, 5 * index); }
    else spans.push([point, 5]);
    if (v.kind !== "input" || naturalInputs) {
      assert(integer(start)); spans.push([start, ts[table.natural].witnessCount]);
    } else assert.equal(start, null);
  });
  const constants = new Map(), usedConstants = new Set();
  for (const c of r.constantDefinitions) {
    const value = bundle.library.fixedConstants[c.valueRef];
    assert.equal(value?.[0], "literal"); assert(/^[1-9][0-9]*$/.test(value[1]));
    assert(value[1] !== "1" && !constants.has(value[1]));
    const t = ts[c.template];
    assert.equal(t?.parameterCount, 10); assert.equal(t.witnessCount, 1);
    assert.deepEqual(t.metadata.fixedIndex, ["ref", c.valueRef]);
    assert.deepEqual(source.nodes[c.firstSourceNode], {op: "const", args: [value[1]]});
    assert(integer(c.point) && integer(c.witnessStart));
    spans.push([c.point, 5], [c.witnessStart, 1]); constants.set(value[1], c.point);
  }
  const operations = new Map();
  for (const row of r.operations) {
    assert([0, 1, 2, 3].includes(row[0]) && integer(row[1]));
    assert(!operations.has(row[1])); operations.set(row[1], row);
  }
  assert.equal(r.sourceNodePoints.length, source.nodes.length);
  const blockMap = new Map((source.witnessBlocks || []).map(b => [b.start, b]));
  let used = 0, aliases = 0;
  for (let i = 0; i < source.nodes.length; i++) {
    const n = source.nodes[i], out = r.sourceNodePoints[i], row = operations.get(i);
    if (n.op === "var") {
      assert(varMap.has(n.args[0])); assert.equal(out, varMap.get(n.args[0])); assert(!row);
    } else if (n.op === "const") {
      const value = n.args[0], expected = {"0": -1, "1": -2, "-1": -3}[value] ?? constants.get(value);
      assert(expected !== undefined); assert.equal(out, expected); assert(!row);
      if (!["0", "1", "-1"].includes(value)) usedConstants.add(value);
    } else if (n.op === "add" || n.op === "mul") {
      assert.equal(n.args.length, 2); assert(n.args.every(j => integer(j) && j < i));
      const [a, b] = n.args.map(j => r.sourceNodePoints[j]);
      let alias, kind = n.op === "add" ? 0 : 1, operands = [a, b];
      if (n.op === "add") {
        if (a === -1) alias = b; else if (b === -1) alias = a;
      } else if (a === -1 || b === -1) alias = -1;
      else if (a === -2 || b === -2) alias = a === -2 ? b : a;
      else if (a === -3 || b === -3) { kind = 3; operands = [a === -3 ? b : a]; }
      else {
        const isTwo = j => source.nodes[j].op === "const" && source.nodes[j].args[0] === "2";
        if (n.args.some(isTwo)) { const x = isTwo(n.args[0]) ? b : a; kind = 0; operands = [x, x]; }
      }
      if (alias !== undefined) { assert(!row); assert.equal(out, alias); aliases++; continue; }
      assert(row); assert.deepEqual(row.slice(0, -2), [kind, i, ...operands]);
      assert.equal(row.at(-2), out); assert(integer(out) && integer(row.at(-1)));
      const key = kind === 0 ? "addition" : kind === 1 ? "multiplication" : "negation";
      spans.push([out, 5], [row.at(-1), ts[table[key]].witnessCount]); used++;
    } else if (n.op === "call") {
      assert(power && row); assert.equal(n.args.length, 5); assert.equal(n.args[0], 0);
      assert(n.args.slice(1, 4).every(j => integer(j) && j < i));
      assert.equal(blockMap.get(n.args[4])?.length, 79);
      assert.deepEqual(row.slice(0, -2), [2, i, ...n.args.slice(1, 4).map(j => r.sourceNodePoints[j])]);
      assert.equal(row.at(-2), out); assert(integer(out) && integer(row.at(-1)));
      spans.push([out, 5], [row.at(-1), power.witnessCount]); used++;
    } else throw Error("Unsupported source operation");
  }
  assert.equal(used, r.operations.length); assert.equal(usedConstants.size, constants.size);
  assert.deepEqual(r.rootEquality, [r.sourceNodePoints[source.root], mode === "value" ? 5 * inputs : -1]);
  checkCoverage(r.parameterCount, r.variableCount, spans, r.name);
  return {name: r.name, witnesses: r.witnessCount, sourceNodesChecked: source.nodes.length,
    operationsChecked: used, aliasesChecked: aliases, completeVariableCoverage: true};
}

function auditBundle(bundle, source, baseline) {
  assert.deepEqual(bundle.definitions, optimizedDefinitions());
  assert.deepEqual(bundle.parameterNames, ["t"]); assert.equal(bundle.parameterDomain, "rational numbers");
  assert.equal(bundle.witnessDomain, "rational numbers"); assert.equal(bundle.rootRecipe, "integers");
  assert.deepEqual(bundle.sourceHashes, baseline.sourceHashes);
  assert.deepEqual(bundle.precisionInputOrder, baseline.precisionInputOrder);
  assert.deepEqual(Object.keys(bundle.recipes), Object.keys(baseline.recipes));
  const library = auditOptimizedLibrary(bundle.library);
  assert.equal(library.interpolationConstructors, 1);
  assert.equal(bundle.recipes.power_value.sourceHash, hash(JSON.stringify(source.templates[0])));
  assert.equal(bundle.recipes.precision.sourceHash, baseline.recipes.precision.sourceHash);
  const evaluations = [
    auditEvaluation(bundle, bundle.recipes.power_value, source.templates[0], {inputs: 3, naturalInputs: false, mode: "value"}),
    auditEvaluation(bundle, bundle.recipes.precision, source, {inputs: 5, naturalInputs: true, mode: "zero"})
  ];
  const compositions = [];
  for (const name of ["close", "main", "value_union", "value", "integers"]) {
    const old = baseline.recipes[name], actual = bundle.recipes[name];
    assert.equal(actual.format, old.format);
    compositions.push(auditComposition(bundle, {...actual, format: "sum-of-squares-composition-v1"}, old.parameterCount, ranges => {
      assert.deepEqual(ranges.map(r => r[1]), old.explicitWitnessRanges.map(r => r[1]));
      const map = new Map(Array.from({length: old.parameterCount}, (_, i) => [i, i]));
      old.explicitWitnessRanges.forEach(([start, length], j) => {
        for (let k = 0; k < length; k++) map.set(start + k, ranges[j][0] + k);
      });
      return old.calls.map(call => ({kind: call.kind,
        target: call.kind === "recipe" ? call.target : bundle.library.templates.findIndex(t => t.name === baseline.library.templates[call.target].name),
        parameters: call.parameters.map(([op, i]) => { assert.equal(op, "var"); assert(map.has(i)); return ["var", map.get(i)]; })}));
    }));
  }
  assert.equal(bundle.witnessCount, bundle.recipes.integers.witnessCount);
  return {valid: true, evaluations, compositions, totalVariables: bundle.witnessCount + 1,
    interpolationConstructors: library.interpolationConstructors,
    scope: "Source wiring, optimized operation selection, finite-constructor syntax and witness scopes; arithmetic equivalence is proved in README.md."};
}

module.exports = {auditEvaluation, auditBundle};
