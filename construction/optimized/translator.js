"use strict";

const {Translator: BaselineTranslator, Allocation} = require("../rational-circuit-translator.js");
const {ordinaryDefinitions} = require("../ordinary-integer-polynomial.js");

// All fast paths have canonical point inputs, by the source-DAG induction.
// Keep this selector independent of allocation and audit it against the source.
function arithmeticPlan(source, node, points) {
  const [a, b] = node.args.map(i => points[i]);
  if (node.op === "add") {
    if (a === -1) return {alias: b};
    if (b === -1) return {alias: a};
    return {kind: 0, inputs: [a, b]};
  }
  if (node.op !== "mul") throw Error("Not an arithmetic node");
  if (a === -1 || b === -1) return {alias: -1};
  if (a === -2) return {alias: b};
  if (b === -2) return {alias: a};
  if (a === -3) return {kind: 3, inputs: [b]};
  if (b === -3) return {kind: 3, inputs: [a]};
  const twice = node.args.findIndex(i => source.nodes[i].op === "const" && source.nodes[i].args[0] === "2");
  if (twice !== -1) {
    const x = twice === 0 ? b : a;
    return {kind: 0, inputs: [x, x]};
  }
  return {kind: 1, inputs: [a, b]};
}

class Translator extends BaselineTranslator {
  translate(source, {name, sourceInputCount, naturalInputs, outputMode, sourceFile, sourceHash, powerRecipe}) {
    const parameterCount = 5 * (sourceInputCount + (outputMode === "value" ? 1 : 0));
    const allocation = new Allocation(parameterCount);
    const generator = [allocation.take(1), allocation.take(1), allocation.take(1)];
    const sourceVariables = [], varRefs = new Map(), sourceNodePoints = [], operations = [];
    const constantDefinitions = [], constantRefs = new Map();
    const operationTemplates = {natural: this.library.id("natural"), addition: this.library.id("raw_add"),
      multiplication: this.library.id("multiply"), negation: this.library.id("raw_negate"),
      power: powerRecipe ? powerRecipe.name : null};
    const explicit = source.variables || Array.from({length: source.variableCount}, (_, index) =>
      ({index, kind: index < sourceInputCount ? "input" : "witness"}));
    const inputs = explicit.filter(v => v.kind === "input");
    if (inputs.length !== sourceInputCount || inputs.some((v, i) => v.index !== i)) throw Error("Invalid source inputs");
    for (const v of explicit) {
      const isInput = v.kind === "input", point = isInput ? 5 * v.index : allocation.take(5);
      const naturalStart = !isInput || naturalInputs ? allocation.take(this.witnesses("natural")) : null;
      varRefs.set(v.index, point); sourceVariables.push([v.index, point, naturalStart]);
    }
    const blockMap = new Map((source.witnessBlocks || []).map(b => [b.start, b]));
    for (let i = 0; i < source.nodes.length; i++) {
      const n = source.nodes[i]; let out;
      if (n.op === "var") {
        if (!varRefs.has(n.args[0])) throw Error("Source variable escapes scope");
        out = varRefs.get(n.args[0]);
      } else if (n.op === "const") {
        const value = n.args[0];
        if (value === "0") out = -1;
        else if (value === "1") out = -2;
        else if (value === "-1") out = -3;
        else if (constantRefs.has(value)) out = constantRefs.get(value);
        else {
          const entry = this.fixedScalar(value); out = allocation.take(5);
          const witnessStart = allocation.take(this.library.templates[entry.template].witnessCount);
          constantRefs.set(value, out);
          constantDefinitions.push({...entry, point: out, witnessStart, firstSourceNode: i});
        }
      } else if (n.op === "add" || n.op === "mul") {
        if (n.args.length !== 2 || n.args.some(j => !Number.isSafeInteger(j) || j < 0 || j >= i)) throw Error("Bad source edge");
        const plan = arithmeticPlan(source, n, sourceNodePoints);
        if (plan.alias !== undefined) out = plan.alias;
        else {
          out = allocation.take(5);
          const target = plan.kind === 0 ? "raw_add" : plan.kind === 1 ? "multiply" : "raw_negate";
          const start = allocation.take(this.witnesses(target));
          operations.push([plan.kind, i, ...plan.inputs, out, start]);
        }
      } else if (n.op === "call") {
        if (!powerRecipe || n.args.length !== 5 || n.args[0] !== 0 ||
            n.args.slice(1, 4).some(j => !Number.isSafeInteger(j) || j < 0 || j >= i) ||
            blockMap.get(n.args[4])?.length !== 79) throw Error("Invalid power call");
        out = allocation.take(5);
        const start = allocation.take(powerRecipe.witnessCount);
        operations.push([2, i, ...n.args.slice(1, 4).map(j => sourceNodePoints[j]), out, start]);
      } else throw Error("Unsupported source node " + n.op);
      sourceNodePoints.push(out);
    }
    return {format: "model-evaluation-polynomial-recipe-v2", name, parameterCount,
      variableCount: allocation.next, witnessCount: allocation.next - parameterCount,
      sourceInputCount, naturalInputs, outputMode, sourceFile, sourceHash,
      sourceRoot: source.root, sourceVariableCount: source.variableCount,
      generator, sourceVariables, sourceNodePoints, constantDefinitions, operations, operationTemplates,
      rootEquality: [sourceNodePoints[source.root], outputMode === "value" ? 5 * sourceInputCount : -1]};
  }
}

function optimizedDefinitions() {
  const definitions = ordinaryDefinitions();
  definitions.expressionSemantics = "All variables range over Q. Literal polynomial substitution with disjoint private witness blocks. Model recipes and conjunctive compositions sum squares; product compositions multiply. Root integers has one free input t.";
  definitions.rootVariableOrdering = "Root variable 0 is the rational input t; all remaining root variables are existential rational witnesses.";
  definitions.modelRecordEncoding.operation3 = "[3,source node,input point,output point,witnessStart] calls operationTemplates.negation on the two point codes; that template has zero private witnesses.";
  definitions.modelRecordEncoding.aliases = "An arithmetic source node omitted from operations is an alias certified by the source audit. sourceNodePoints is diagnostic and contributes no equations. All allocated operation records remain conjuncts.";
  definitions.modelRecipeConstraints = "The three generator equations, all recorded natural/scalar/add/multiply/power/negate calls, and the five root differences are individually squared and summed. Operation tags are 0=add, 1=multiply, 2=power-value, 3=negate.";
  definitions.finiteGuardInterpolation = {
    binding: "args=[fixed cutoff expression, fifteen coordinate node indices, inverse-witness node index]",
    distance: "For each -T<=n<=T, write iota(n)_j=A_nj/B_nj in reduced form, B_nj>0. D_n=product_j B_nj; d_n(X)=sum_j(D_n X_j-(D_n/B_nj)A_nj)^2.",
    weights: "p_n(X)=product_{m!=n} d_m(X). Reduce n/p_n(iota(n))=a_n/b_n with b_n>0. C=product_n b_n; H(X)=sum_n a_n(C/b_n)p_n(X); D(X)=product_n d_n(X).",
    polynomial: "(H(X)H(Y)-C H(Z))*((D(X)+D(Y)+D(Z))*u-1). The inverse witness u is supplied explicitly. This is the literal integer polynomial denoted by the constructor.",
    termination: "All code points are distinct, so p_n(iota(n))>0; the finite products and reductions are well defined. T=0 gives the zero polynomial."
  };
  return definitions;
}

module.exports = {Translator, arithmeticPlan, optimizedDefinitions};
