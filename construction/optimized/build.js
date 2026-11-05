"use strict";

const fs = require("node:fs"), path = require("node:path"), assert = require("node:assert/strict");
const {hash, composition} = require("../rational-circuit-translator.js");
const {finiteArtifact} = require("../finite-polynomial-expressions.js");
const {addVariableShiftTemplates} = require("../variable-shift-polynomial-library.js");
const {buildOptimizedModel} = require("./model.js");
const {Translator, optimizedDefinitions} = require("./translator.js");
const {auditBundle} = require("./audit.js");

function readInputs() {
  const root = path.resolve(__dirname, ".."), manifest = require("../SOURCE_MANIFEST.json");
  const read = (file, digest) => {
    const bytes = fs.readFileSync(path.join(root, file)); assert.equal(hash(bytes), digest);
    return JSON.parse(bytes);
  };
  return {manifest, source: read("precision-natural-polynomial.json", manifest.precision_sha256),
    baseline: read("ordinary-integer-definition.json", manifest.polynomial_sha256)};
}

function build() {
  const {manifest, source, baseline} = readInputs();
  const library = buildOptimizedModel(); addVariableShiftTemplates(library);
  const translator = new Translator(library), sourceFile = "precision-natural-polynomial.json";
  const recipes = {};
  recipes.power_value = translator.translate(source.templates[0], {
    name: "power_value", sourceInputCount: 3, naturalInputs: false, outputMode: "value",
    sourceFile: sourceFile + "#templates/0", sourceHash: hash(JSON.stringify(source.templates[0]))});
  recipes.precision = translator.translate(source, {
    name: "precision", sourceInputCount: 5, naturalInputs: true, outputMode: "zero", sourceFile,
    sourceHash: manifest.precision_sha256, powerRecipe: recipes.power_value});
  for (const name of ["close", "main", "value_union", "value", "integers"]) {
    const old = baseline.recipes[name];
    const recipe = composition(name, old.parameterCount, (fresh, call) => {
      const map = new Map(Array.from({length: old.parameterCount}, (_, i) => [i, i]));
      for (const [start, length] of old.explicitWitnessRanges) {
        const next = fresh(length);
        for (let k = 0; k < length; k++) map.set(start + k, next + k);
      }
      for (const c of old.calls) {
        const target = c.kind === "recipe" ? c.target : library.id(baseline.library.templates[c.target].name);
        const callee = c.kind === "recipe" ? recipes[target] : library.templates[target];
        const parameters = c.parameters.map(([op, i]) => {
          assert.equal(op, "var"); assert(map.has(i), "Private witness escaped composition");
          return ["var", map.get(i)];
        });
        call(c.kind, target, parameters, callee.witnessCount);
      }
    });
    recipe.format = old.format; recipes[name] = recipe;
  }
  const bundle = {...baseline, format: "optimized-ordinary-integer-polynomial-expression-v1",
    status: "Equivalent construction subject to the same arithmetic inputs as the dated baseline; see optimized/README.md.",
    witnessCount: recipes.integers.witnessCount, definitions: optimizedDefinitions(),
    library: finiteArtifact(library, translator.extraConstants, {meaning: "Three-square natural predicate and interpolation guard"}),
    recipes, baselinePolynomialSha256: manifest.polynomial_sha256};
  bundle.library.finitePolynomialConstructors.finite_guard_interpolation = bundle.definitions.finiteGuardInterpolation;
  bundle.library.finitePolynomialConstructors.version = 2;
  const checks = auditBundle(bundle, source, baseline);
  const data = JSON.stringify(bundle) + "\n";
  const report = {passed: true, baselinePolynomialSha256: manifest.polynomial_sha256,
    optimizedPolynomialSha256: hash(data), bytes: Buffer.byteLength(data),
    baselineTotalVariables: baseline.witnessCount + 1, totalVariables: bundle.witnessCount + 1,
    variablesRemoved: baseline.witnessCount - bundle.witnessCount,
    templates: Object.fromEntries(library.templates.map(t => [t.name, {witnesses: t.witnessCount, nodes: t.nodes.length}])),
    recipes: Object.fromEntries(Object.entries(recipes).map(([name, r]) => [name, {
      witnesses: r.witnessCount, operations: (r.operations || []).reduce((counts, row) => {
        const key = ["add", "multiply", "power", "negate"][row[0]];
        counts[key] = (counts[key] || 0) + 1; return counts;
      }, {})}])), checks, arithmeticTheoremProved: false};
  return {bundle, source, baseline, data, report};
}

module.exports = {build, readInputs};
if (require.main === module) {
  const output = process.argv[2];
  assert(output, "Usage: node construction/optimized/build.js OUTPUT_DIRECTORY");
  const {data, report} = build();
  fs.mkdirSync(output, {recursive: true});
  fs.writeFileSync(path.join(output, "ordinary-integer-definition.json"), data);
  fs.writeFileSync(path.join(output, "build-report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
}
