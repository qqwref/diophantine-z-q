"use strict";

const {buildFiniteModel, validateFixedExpression} = require("../finite-polynomial-expressions.js");
const {auditOptimizedFixedDefinitions} = require("./constants.js");
const {PolynomialLibrary, auditLibrary} = require("../rational-polynomial-library.js");
const {EllipticCore} = require("../rational-elliptic-core.js");
const {indexCode} = require("../rational-field-arithmetic.js");
const names = prefix => Array.from({length: 5}, (_, i) => `${prefix}.${i}`);

// Specialize A*B=C to A*A=C before allocating existential witnesses.
// Both copies of A have the same homogeneous coordinates and slope context.
function addSquare(library) {
  library.define("square.height_certificate", names("A").concat(names("C"), ["ell"],
    ...["shift.P", "shift.A", "shift.C"].map(names)), (b, p) => {
    const roots = [p.slice(0, 5), p.slice(5, 10)], ell = p[10];
    const context = p.slice(11, 21).concat(p.slice(16, 21), p.slice(21, 26));
    const f = [], quantities = [];
    roots.forEach((point, i) => {
      f.push(b.call("member", point));
      const a0 = b.fresh(`homogeneous.${i}.a0`), a1 = b.fresh(`homogeneous.${i}.a1`);
      const den = b.fresh(`homogeneous.${i}.b`);
      f.push(b.nonzero(den, `homogeneous.${i}.inverse_b`),
        b.eq(b.mul(den, point[1]), a0), b.eq(b.mul(den, point[2]), a1));
      quantities.push(a0, a1, den);
    });
    quantities.forEach((quantity, i) => {
      const slopes = Array.from({length: 3}, (_, j) => b.fresh(`slope.${i}.${j}`));
      f.push(b.eq(b.add(...slopes), quantity));
      slopes.forEach(t => f.push(b.call("slope", [t, ell, ...context])));
    });
    return b.and(...f);
  }, {meaning: "Eighteen slope certificates for the two distinct roots of a square relation",
    proof: "optimized/program-and-square.md"});
  library.define("square", names("A").concat(names("C")), (b, p) => {
    const e = new EllipticCore(b), A = p.slice(0, 5), C = p.slice(5), f = [];
    const shifts = [e.P(), A, C].map((point, i) => {
      const out = e.point(`shift.${i}`);
      f.push(b.call("multiply.scalar", point.concat(out)));
      return out;
    });
    const ell = b.node("fixed_integer", [["ref", "ell"]]);
    f.push(b.call("square.height_certificate", p.concat([ell], shifts.flat())),
      b.call("multiply.guard", A.concat(A, C)));
    return b.and(...f);
  }, {meaning: "Exact index squaring, sharing the duplicated input certificate",
    proof: "optimized/program-and-square.md"});
}

function addThreeSquareNatural(library) {
  library.define("natural", names("N"), (b, N) => {
    const e = new EllipticCore(b), conditions = [b.call("member", N)];
    const squares = Array.from({length: 3}, (_, i) => {
      const root = e.point(`root.${i}`), square = e.point(`square.${i}`);
      conditions.push(b.call("square", root.concat(square)));
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
  library.templates[library.id("multiply")].metadata.fixedConstantBinding = "optimizedFixedDefinitions-v5";
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
  addSquare(library);
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
