"use strict";

const {fixedDefinitions, validateFixedExpression, ref, lit} = require("../finite-polynomial-expressions.js");

// Preserve the catalogue, formal multiplier and cutoff formula. Only the
// degree bounds for the fibre splitting field and its Hom field change.
// See cutoff.md for the geometric argument and all downstream estimates.
function optimizedFixedDefinitions(extra = {}) {
  const definitions = fixedDefinitions(extra);
  definitions.F = ["factorial", lit(144)];
  definitions.D = ["mul", ["mul", lit(2), ref("F")],
    ["pow", lit(51840), ["add", ref("F"), lit(-1)]]];
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
