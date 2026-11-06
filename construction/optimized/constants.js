"use strict";

const {fixedDefinitions, validateFixedExpression, ref, lit} = require("../finite-polynomial-expressions.js");

const CATALOGUE_MODULUS = 56n; // 8 * 7
const CATALOGUE_COUNT = 45;

// Keep P0 (all primes <=324), but use the smaller catalogue proved in
// prime-catalogue.md. The CM reduction orders give prime support <=Hmax.
// See height-refinements.md for the field, height and scalar estimates.
function optimizedFixedDefinitions(extra = {}) {
  const definitions = fixedDefinitions(extra);
  definitions.W = lit(CATALOGUE_MODULUS);
  definitions.Hproduct = ["catalogue_product", ref("W"), lit(CATALOGUE_COUNT), lit(324)];
  definitions.Hmax = ["catalogue_max", ref("W"), lit(CATALOGUE_COUNT), lit(324)];
  definitions.F = lit(144);
  definitions.D = ref("F");
  definitions.G0 = lit(480);
  definitions.E0 = lit(24);
  definitions.R = ["max", ref("D"), ref("Hmax")];
  definitions.Q = ["mul", ["pow", lit(2), lit(24)], ["mul",
    ["pow", lit(3), lit(11)], ["pow", lit(4), ["mul", lit(2), ref("R")]]]];
  definitions.Bcm = lit(100000000);
  definitions.Ccm = lit(210000000);
  definitions.Aheight = ["mul", ["mul", lit(2), ["pow", lit(10), lit(13)]],
    ["max", lit(1), ref("Ccm"), ["mul", lit(14000000), ["pow", ref("Q"), lit(12)]]]];
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

module.exports = {CATALOGUE_MODULUS, CATALOGUE_COUNT, optimizedFixedDefinitions, auditOptimizedFixedDefinitions};
