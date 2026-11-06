"use strict";

const {fixedDefinitions, validateFixedExpression, ref, lit} = require("../finite-polynomial-expressions.js");

// Preserve the catalogue, formal multiplier and cutoff formula. The fibre
// field already defines all Hom groups. R bounds prime support, not cstar.
// See cutoff.md for the geometric argument and all downstream estimates.
function optimizedFixedDefinitions(extra = {}) {
  const definitions = fixedDefinitions(extra);
  definitions.F = lit(144);
  definitions.D = ref("F");
  definitions.G0 = lit(480);
  definitions.E0 = lit(866);
  definitions.R = ["max", ref("D"), ["pow", ref("Hmax"), lit(3)],
    ["pow", lit(10), lit(12)]];
  return definitions;
}

function auditOptimizedFixedDefinitions(definitions) {
  const known = new Set();
  for (const [name, value] of Object.entries(definitions)) {
    validateFixedExpression(value, known); known.add(name);
  }
  const expected = optimizedFixedDefinitions();
  for (const [name, value] of Object.entries(expected)) {
    if (JSON.stringify(definitions[name]) !== JSON.stringify(value))
      throw Error("Prescribed optimized constant changed: " + name);
  }
  for (const name of known)
    if (!(name in expected) && definitions[name][0] !== "literal")
      throw Error("Extra fixed constant must be literal");
  return known;
}

module.exports = {optimizedFixedDefinitions, auditOptimizedFixedDefinitions};
