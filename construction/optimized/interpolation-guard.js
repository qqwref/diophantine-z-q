"use strict";

// Exact replacement of the finite false-triple exclusion relation. The actual
// cutoff is symbolic; materialization below is for small verification fixtures.
const {indexCode, q, qadd, qsub, qmul, qdiv} = require("../rational-field-arithmetic.js");

function interpolationData(cutoff) {
  const T = BigInt(cutoff);
  if (T < 0n) throw Error("Negative guard cutoff");
  const rows = [];
  for (let n = -T; n <= T; n++) {
    const code = indexCode(n);
    const denominator = code.reduce((d, [, b]) => d * b, 1n);
    rows.push({n, code, denominator,
      numerators: code.map(([a, b]) => denominator / b * a)});
  }
  const coefficients = rows.map((row, i) => {
    let value = q(1);
    rows.forEach((other, j) => {
      if (i !== j) value = qmul(value, distanceValue(other, row.code));
    });
    return qdiv(q(row.n), value);
  });
  // A product, rather than an lcm, makes the finite prescription elementary.
  const scale = coefficients.reduce((d, [, b]) => d * b, 1n);
  return {rows, scale, weights: coefficients.map(([a, b]) => a * (scale / b))};
}

function distanceValue(row, point) {
  return point.reduce((sum, x, j) => {
    const delta = qsub(qmul(q(row.denominator), x), q(row.numerators[j]));
    return qadd(sum, qmul(delta, delta));
  }, q(0));
}

// Prefix/suffix products share all omitted-factor products in O(N) gates.
function productAndLabel(b, point, data) {
  const factors = data.rows.map(row => b.add(...point.map((x, j) =>
    b.square(b.sub(b.scale(row.denominator, x), b.constant(row.numerators[j]))))));
  const prefix = [b.constant(1)], suffix = Array(factors.length + 1);
  suffix[factors.length] = b.constant(1);
  for (const factor of factors) prefix.push(b.mul(prefix.at(-1), factor));
  for (let i = factors.length - 1; i >= 0; i--) suffix[i] = b.mul(factors[i], suffix[i + 1]);
  const label = b.add(...data.weights.map((weight, i) =>
    b.mul(b.constant(weight), prefix[i], suffix[i + 1])));
  return {product: prefix.at(-1), label};
}

function interpolationGuard(b, inputs, inverse, cutoff) {
  if (inputs.length !== 15) throw Error("Expected three five-coordinate codes");
  const data = interpolationData(cutoff);
  const values = [0, 5, 10].map(i => productAndLabel(b, inputs.slice(i, i + 5), data));
  const outside = b.add(...values.map(v => v.product));
  const error = b.sub(b.mul(values[0].label, values[1].label),
    b.scale(data.scale, values[2].label));
  return b.mul(error, b.sub(b.mul(outside, inverse), b.constant(1)));
}

function evaluateGuardParts(data, points) {
  const values = points.map(point => {
    const factors = data.rows.map(row => distanceValue(row, point));
    const product = factors.reduce(qmul, q(1));
    const label = data.weights.reduce((sum, weight, i) => qadd(sum,
      factors.reduce((term, factor, j) => i === j ? term : qmul(term, factor), q(weight))), q(0));
    return {product, label};
  });
  return {
    outside: values.reduce((sum, v) => qadd(sum, v.product), q(0)),
    error: qsub(qmul(values[0].label, values[1].label), qmul(q(data.scale), values[2].label))
  };
}

module.exports = {interpolationData, interpolationGuard, evaluateGuardParts, distanceValue};
