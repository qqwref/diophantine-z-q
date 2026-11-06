"use strict";

const {fixedDefinitions, validateFixedExpression, ref, lit} = require("../finite-polynomial-expressions.js");

const CATALOGUE_MODULUS = 185640n; // 8 * 3 * 5 * 7 * 13 * 17

// Keep P0 (all primes <=324), but use the smaller catalogue proved in
// prime-catalogue.md. The CM reduction orders give prime support <=Hmax.
// See cutoff.md for the field, height and downstream scalar estimates.
function optimizedFixedDefinitions(extra = {}) {
  const definitions = fixedDefinitions(extra);
  definitions.W = lit(CATALOGUE_MODULUS);
  definitions.F = lit(144);
  definitions.D = ref("F");
  definitions.G0 = lit(480);
  definitions.E0 = lit(866);
  definitions.R = ["max", ref("D"), ref("Hmax")];
  definitions.Q = ["pow", lit(4), ["mul", ref("R"), ref("E0")]];
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

module.exports = {CATALOGUE_MODULUS, optimizedFixedDefinitions, auditOptimizedFixedDefinitions};
