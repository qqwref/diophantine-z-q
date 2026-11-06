"use strict";

const {buildFiniteModel, validateFixedExpression} = require("../finite-polynomial-expressions.js");
const {auditOptimizedFixedDefinitions} = require("./constants.js");
const {PolynomialLibrary, auditLibrary} = require("../rational-polynomial-library.js");
const {EllipticCore} = require("../rational-elliptic-core.js");
const {indexCode} = require("../rational-field-arithmetic.js");
const names = prefix => Array.from({length: 5}, (_, i) => `${prefix}.${i}`);

function addThreeSquareNatural(library) {
  library.define("natural", names("N"), (b, N) => {
    const e = new EllipticCore(b), conditions = [b.call("member", N)];
    const squares = Array.from({length: 3}, (_, i) => {
      const root = e.point(`root.${i}`), square = e.point(`square.${i}`);
      conditions.push(b.call("multiply", root.concat(root, square)));
      return square;
    });
    let eightN = N;
    for (let i = 0; i < 3; i++) {
      const doubled = e.point(`double.${i}`);
      conditions.push(b.call("raw_add", eightN.concat(eightN, doubled)));
      eightN = doubled;
    }
    const three = indexCode(3).map(([a, d]) => b.rational(a, d));
    const target = e.point("eightNplusThree"), partial = e.point("partialSum");
    conditions.push(b.call("raw_add", eightN.concat(three, target)),
      b.call("raw_add", squares[0].concat(squares[1], partial)),
      b.call("raw_add", partial.concat(squares[2], target)));
    return b.and(...conditions);
  }, {meaning: "N=iota(n), n>=0 iff 8n+3 is a sum of three integer squares",
    preconditions: "Exact multiplication on arbitrary input codes; member is imposed on N",
    theorem: "Legendre three-square theorem; see optimized/README.md"});
}

function buildOptimizedModel({interpolation = true} = {}) {
  const library = buildFiniteModel();
  library.templates[library.id("multiply")].metadata.fixedConstantBinding = "optimizedFixedDefinitions-v3";
  if (library.templates.at(-1).name !== "natural") throw Error("Baseline model order changed");
  library.templates.pop(); library.names.delete("natural");
  if (interpolation) {
    const guard = new PolynomialLibrary();
    guard.define("multiply.guard", names("A").concat(names("B"), names("C")), (b, p) => {
      const inverse = b.fresh("outside_inverse");
      const node = b.node("finite_guard_interpolation", [["ref", "T"], ...p, inverse]);
      return b.fnode("polynomial", [node]);
    }, {meaning: "Exclude exactly the false code triples in [-T,T]^3 by interpolation",
      cutoff: ["ref", "T"], proof: "optimized/README.md"});
    library.templates[library.id("multiply.guard")] = guard.templates[0];
  }
  addThreeSquareNatural(library);
  library.define("raw_negate", names("P").concat(names("R")), (b, p) => {
    const e = new EllipticCore(b);
    return e.peq(e.neg(p.slice(0, 5)), p.slice(5));
  }, {meaning: "R=-P by coordinate negation", preconditions: "P is canonical"});
  return library;
}

function auditOptimizedLibrary(library) {
  const known = auditOptimizedFixedDefinitions(library.fixedConstants);
  let interpolations = 0;
  const fake = {templates: library.templates.map(t => ({...t, nodes: t.nodes.map((n, i) => {
    if (["const", "var", "add", "mul", "call"].includes(n.op)) return n;
    let refs;
    if (n.op === "fixed_integer") {
      if (n.args.length !== 1) throw Error("Bad fixed integer constructor");
      refs = [];
    } else if (n.op === "psi_component") {
      if (n.args.length !== 6 || ![0, 1].includes(n.args[5])) throw Error("Bad psi constructor");
      refs = n.args.slice(1, 5);
    } else if (["finite_guard_product", "finite_guard_interpolation"].includes(n.op)) {
      const interpolated = n.op === "finite_guard_interpolation";
      if (n.args.length !== (interpolated ? 17 : 16) ||
          JSON.stringify(n.args[0]) !== JSON.stringify(["ref", "T"])) throw Error("Bad guard binding");
      if (interpolated) interpolations++;
      refs = n.args.slice(1);
    } else throw Error("Unknown constructor " + n.op);
    validateFixedExpression(n.args[0], known);
    if (refs.some(j => !Number.isSafeInteger(j) || j < 0 || j >= i)) throw Error("Bad constructor edge");
    return {op: "const", args: ["0"]};
  })}))};
  return {...auditLibrary(fake), interpolationConstructors: interpolations};
}

module.exports = {buildOptimizedModel, addThreeSquareNatural, auditOptimizedLibrary};
