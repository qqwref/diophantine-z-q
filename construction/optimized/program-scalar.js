"use strict";

const assert = require("node:assert/strict");
const {hash} = require("../rational-circuit-translator.js");

// The manuscript's enumeration: e+1=2^w(2D+1), four base-2^w
// digits per instruction, least significant instruction first.
function decode(code) {
  let n = BigInt(code) + 1n, width = 0;
  assert(n > 0n);
  while (!(n & 1n)) { width++; n >>= 1n; }
  if (!width) return {width, program: []};
  assert(width <= 30, "Only safely materializable instruction fields are supported");
  const data = ((n - 1n) / 2n).toString(2);
  const digit = i => {
    const end = data.length - i * width;
    return end <= 0 ? 0 : parseInt(data.slice(Math.max(0, end - width), end), 2);
  };
  const program = Array.from({length: Math.ceil(data.length / (4 * width))}, (_, i) =>
    ({op: digit(4*i), r: digit(4*i+1), a: digit(4*i+2), b: digit(4*i+3)}));
  return {width, program};
}

function encode(program) {
  if (!program.length) return "0";
  const largest = program.reduce((m, x) => Math.max(m, x.op, x.r, x.a, x.b), 2);
  const width = largest.toString(2).length;
  const digits = program.flatMap(x => [x.op, x.r, x.a, x.b]);
  const data = BigInt("0b" + digits.reverse().map(n => n.toString(2).padStart(width, "0")).join(""));
  return (((2n * data + 1n) << BigInt(width)) - 1n).toString();
}

function simplify(program) {
  // Virtual final registers are unobserved. In particular a suffix of clearing
  // loops can be replaced by a halt. Record a well-founded local certificate.
  const predecessors = program.map(() => []);
  program.forEach((x,i) => {
    for (const j of x.op === 1 ? [x.a] : x.op === 2 ? [x.a,x.b] : [])
      if (j < program.length) predecessors[j].push(i);
  });
  const halting = new Set(), haltingOrder = [], pendingHalts = program.map((_,i) => i);
  const isHalt = i => halting.has(i) || ![1,2].includes(program[i]?.op);
  for (let head = 0; head < pendingHalts.length; head++) {
    const i = pendingHalts[head], x = program[i];
    if (halting.has(i)) continue;
    if (![1,2].includes(x.op) || x.op === 1 && isHalt(x.a) ||
        x.op === 2 && isHalt(x.b) && (x.a === i || isHalt(x.a))) {
      halting.add(i); haltingOrder.push(i); pendingHalts.push(...predecessors[i]);
    }
  }
  const written = new Set([0]); // arbitrary input in r0; every other register initially zero
  for (const x of program) if (x.op === 1) written.add(x.r);
  const redirects = new Map(); let zeroTests = 0, cancellingPairs = 0;
  program.forEach((x, i) => {
    if (x.op === 2 && !written.has(x.r)) {
      redirects.set(i, x.b); zeroTests++;
    } else if (x.op === 1 && program[x.a]?.op === 2 && program[x.a].r === x.r) {
      redirects.set(i, program[x.a].a); cancellingPairs++;
    }
  });
  // -1 is a divergent trap, -2 a halt. Never turn a redirect cycle into a halt.
  const memo = new Map();
  function resolve(start) {
    if (halting.has(start)) return -2;
    const path = [], seen = new Set(); let i = start;
    while (redirects.has(i) && !halting.has(i) && !memo.has(i) && !seen.has(i)) {
      path.push(i); seen.add(i); i = redirects.get(i);
    }
    const result = halting.has(i) ? -2 : memo.has(i) ? memo.get(i) : seen.has(i) ? -1 :
      i < 0 || ![1, 2].includes(program[i]?.op) ? -2 : i;
    for (const j of path) memo.set(j, result);
    return result;
  }
  const entry = resolve(0), reachable = new Set(), pending = [entry];
  while (pending.length) {
    const i = pending.pop();
    if (i === -2 || reachable.has(i)) continue;
    reachable.add(i);
    if (i === -1) continue;
    const x = program[i]; pending.push(resolve(x.a));
    if (x.op === 2) pending.push(resolve(x.b));
  }
  const order = entry === -2 ? [] : [entry, ...[...reachable].filter(i => i !== entry).sort((a,b) => a-b)];
  const states = new Map(order.map((i,j) => [i,j])); states.set(-2, order.length);
  const registers = new Set([0]);
  for (const i of order) if (i >= 0) registers.add(program[i].r);
  const registerOrder = [...registers].sort((a,b) => a-b);
  const registerMap = new Map(registerOrder.map((r,j) => [r,j]));
  const compact = order.map((i,j) => i === -1 ? {op:2, r:0, a:j, b:j} : {
    op: program[i].op, r: registerMap.get(program[i].r),
    a: states.get(resolve(program[i].a)),
    b: program[i].op === 2 ? states.get(resolve(program[i].b)) : 0
  });
  return {program: compact, order, registerOrder, haltingOrder, zeroTests, cancellingPairs};
}

// Separate local simulation check, including the terminating-tail certificate.
// Other skipped steps are globally-zero tests or increment/decrement pairs.
// Their register effect is the identity; a closed chain is divergence.
function verifySimulation(original, compact, certificate) {
  const {order, registerOrder, haltingOrder} = certificate;
  assert.equal(compact.length, order.length);
  assert.equal(new Set(order).size, order.length);
  assert.equal(new Set(registerOrder).size, registerOrder.length);
  assert.equal(registerOrder[0], 0);
  const assigned = new Set(original.filter(x => x.op === 1).map(x => x.r));
  assigned.add(0);
  const stateMap = new Map(order.map((x,i) => [x,i]));
  const registerMap = new Map(registerOrder.map((x,i) => [x,i]));
  const halting = new Set();
  const alreadyHalts = i => halting.has(i) || ![1,2].includes(original[i]?.op);
  for (const i of haltingOrder) {
    assert(Number.isSafeInteger(i) && i >= 0 && i < original.length && !halting.has(i));
    const x = original[i];
    if (x.op === 1) assert(alreadyHalts(x.a));
    if (x.op === 2) { assert(alreadyHalts(x.b)); assert(x.a === i || alreadyHalts(x.a)); }
    halting.add(i);
  }
  function destination(start) {
    const visited = new Set(); let i = start;
    for (;;) {
      if (visited.has(i)) { assert(stateMap.has(-1)); return stateMap.get(-1); }
      visited.add(i);
      if (halting.has(i)) return compact.length;
      const x = original[i];
      if (!x || (x.op !== 1 && x.op !== 2)) return compact.length;
      if (x.op === 2 && !assigned.has(x.r)) { i = x.b; continue; }
      const next = original[x.a];
      if (x.op === 1 && next?.op === 2 && next.r === x.r) { i = next.a; continue; }
      assert(stateMap.has(i), "Missing reachable state"); return stateMap.get(i);
    }
  }
  assert.equal(destination(0), compact.length ? 0 : compact.length);
  order.forEach((i,j) => {
    const y = compact[j];
    if (i === -1) { assert.deepEqual(y, {op:2, r:0, a:j, b:j}); return; }
    assert(Number.isSafeInteger(i) && i >= 0 && i < original.length);
    const x = original[i];
    assert.equal(y.op, x.op); assert.equal(y.r, registerMap.get(x.r));
    assert.equal(y.a, destination(x.a));
    assert.equal(y.b, x.op === 2 ? destination(x.b) : 0);
  });
  return true;
}

function optimizeCode(code) {
  const original = decode(code), certificate = simplify(original.program);
  verifySimulation(original.program, certificate.program, certificate);
  const optimized = encode(certificate.program), decoded = decode(optimized);
  assert.deepEqual(decoded.program, certificate.program);
  return {code: optimized, report: {
    originalCodeSha256: hash(code), optimizedCodeSha256: hash(optimized),
    originalDecimalDigits: code.length, optimizedDecimalDigits: optimized.length,
    originalBitLength: BigInt(code).toString(2).length,
    optimizedBitLength: BigInt(optimized).toString(2).length,
    originalInstructions: original.program.length, optimizedInstructions: certificate.program.length,
    originalWidth: original.width, optimizedWidth: decoded.width,
    zeroTestsRemoved: certificate.zeroTests, cancellingPairsRemoved: certificate.cancellingPairs,
    certifiedAlwaysHaltingStates: certificate.haltingOrder.length,
    registersAfterRenaming: certificate.registerOrder.length,
    allInputHaltingSimulationChecked: true,
    scope: "Local state correspondence for arbitrary natural input in r0 and zero in all other registers; not a test of the precision algorithm itself"
  }};
}

const cache = new WeakMap();
function optimizedSource(source) {
  if (cache.has(source)) return cache.get(source);
  const index = source.metadata.programCodeNode;
  assert.equal(index, 0); assert.equal(source.nodes[index].op, "const");
  const result = optimizeCode(source.nodes[index].args[0]);
  const nodes = source.nodes.slice(); nodes[index] = {op: "const", args: [result.code]};
  const transformed = {...source, nodes, metadata: {
    meaning: "Precision predicate with an equivalent compacted program scalar",
    programCodeNode: index, originalSourceMetadata: source.metadata,
    optimizedProgram: result.report}};
  const value = {source: transformed, report: result.report, sourceHash: hash(JSON.stringify(transformed))};
  cache.set(source, value); return value;
}

module.exports = {decode, encode, simplify, verifySimulation, optimizeCode, optimizedSource};
