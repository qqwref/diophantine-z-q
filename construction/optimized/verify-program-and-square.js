"use strict";

const assert = require("node:assert/strict");
const {hash} = require("../rational-circuit-translator.js");
const {decode, encode, simplify, verifySimulation} = require("./program-scalar.js");
const {buildOptimizedModel} = require("./model.js");

function verifyProgramFixtures() {
  // Finite-state fixtures distinguish a halt, a nonzero branch, and a redirect
  // cycle. Counts are bounded only in these tests, never in the simulation proof.
  const fixtures = [[],
    [{op:2,r:1,a:0,b:1}],
    [{op:2,r:1,a:1,b:0}],
    [{op:1,r:0,a:1,b:0},{op:2,r:0,a:2,b:0}],
    [{op:2,r:0,a:1,b:2},{op:1,r:1,a:0,b:0}],
    [{op:1,r:2,a:1,b:0},{op:2,r:2,a:2,b:0},{op:2,r:2,a:0,b:3}],
    [{op:2,r:1,a:1,b:2},{op:1,r:2,a:2,b:0},{op:2,r:2,a:3,b:4},{op:2,r:0,a:2,b:4}]
  ];
  function run(program, input) {
    const regs = [input]; let pc = 0;
    for (let step = 0; step < 1000; step++) {
      const x = program[pc]; if (!x || ![1,2].includes(x.op)) return true;
      if (x.op === 1) { regs[x.r] = (regs[x.r] || 0) + 1; pc = x.a; }
      else if (regs[x.r]) { regs[x.r]--; pc = x.a; } else pc = x.b;
    }
    return false;
  }
  let cases = 0;
  for (const original of fixtures) {
    assert.deepEqual(decode(encode(original)).program, original);
    const certificate = simplify(original), compact = certificate.program;
    assert(verifySimulation(original, compact, certificate));
    for (let input = 0; input <= 12; input++) {
      assert.equal(run(original, input), run(compact, input)); cases++;
    }
  }
  const original = fixtures[4], certificate = simplify(original);
  const changed = certificate.program.map(x => ({...x})); changed[0].r = 1;
  assert.throws(() => verifySimulation(original, changed, certificate));
  const trap = simplify(fixtures[2]);
  assert.throws(() => verifySimulation(fixtures[2], [], {...trap, order: []}));
  assert.throws(() => verifySimulation(fixtures[2], [], {...trap, order: [], haltingOrder: [0]}));
  return {programs: fixtures.length, finiteInputComparisons: cases, mutationsRejected: 3};
}

// Compare conjunction leaves with call predicates kept as exact contracts.
// Witness names identify the deliberate shared copies. This independently
// checks all parameter wiring and every homogeneous/slope equation.
function leaves(template, library, rename, rewriteCall = (name, args) => [name, args]) {
  const variables = new Map(template.variables.map(v => [v.index, rename(v)]));
  const nodes = []; // hashes in dependency order
  template.nodes.forEach((n, i) => {
    let expression;
    if (n.op === "var") { assert(variables.has(n.args[0])); expression = ["var", variables.get(n.args[0])]; }
    else if (n.op === "const" || n.op === "fixed_integer") expression = [n.op, ...n.args];
    else if (n.op === "add" || n.op === "mul") expression = [n.op, ...n.args.map(j => nodes[j])];
    else if (n.op === "call") expression = ["call", ...rewriteCall(library.templates[n.args[0]].name,
      n.args.slice(1,-1).map(j => nodes[j]))];
    else throw Error("Unexpected node in certificate wrapper");
    nodes[i] = hash(JSON.stringify(expression));
  });
  const result = new Set();
  function walk(i) {
    const f = template.formulas[i];
    if (f.op === "and") f.args.forEach(walk);
    else { assert(["eq", "polynomial"].includes(f.op)); result.add(JSON.stringify([f.op, ...f.args.map(j => nodes[j])])); }
  }
  walk(template.formula); return [...result].sort();
}

function verifySquareStructure() {
  const l = buildOptimizedModel(), get = n => l.templates[l.id(n)];
  const inputMap = [0,1,2,3,4,0,1,2,3,4,5,6,7,8,9,10,
    11,12,13,14,15,16,17,18,19,20,16,17,18,19,20,21,22,23,24,25];
  const oldHeight = v => v.kind === "input" ? `p${inputMap[v.index]}` :
    v.name.replace(/^homogeneous\.(\d+)/, (_, i) => `homogeneous.${i < 2 ? 0 : 1}`)
      .replace(/^slope\.(\d+)/, (_, i) => `slope.${i < 6 ? i % 3 : i - 3}`);
  const newHeight = v => v.kind === "input" ? `p${v.index}` : v.name;
  const original = leaves(get("height_certificate"), l, oldHeight);
  const specialized = leaves(get("square.height_certificate"), l, newHeight);
  assert.deepEqual(specialized, original);
  const input = i => i < 10 ? i % 5 : i - 5;
  const oldOuter = v => v.kind === "input" ? `p${input(v.index)}` :
    v.name.replace(/^shift\.(\d+)/, (_, i) => `shift.${i < 2 ? i : i - 1}`);
  const newOuter = v => v.kind === "input" ? `p${v.index}` : v.name;
  const rewrite = (name, args) => name === "height_certificate" ?
    ["square.height_certificate", args.slice(0,5).concat(args.slice(10,26), args.slice(31))] : [name,args];
  const oldLeaves = leaves(get("multiply"), l, oldOuter, rewrite);
  const newLeaves = leaves(get("square"), l, newOuter);
  assert.deepEqual(newLeaves, oldLeaves);
  assert.equal(get("multiply").witnessCount - get("square").witnessCount, 11708);
  return {heightConjunctsAfterSharing: specialized.length,
    outerConjunctsAfterSharing: newLeaves.length, witnessesSavedPerSquare: 11708,
    scope: "Exact conjunction wiring after identifying duplicate existential certificates; callee contracts are retained"};
}

module.exports = {verifyProgramFixtures, verifySquareStructure};
