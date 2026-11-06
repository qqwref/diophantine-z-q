# Program scalar and shared square certificates

These refinements leave the catalogue, the height argument, and the cutoff T
unchanged. They reduce a separate fixed scalar and the number of existential
variables. No conversion to a higher-dimensional low-degree system is used.

## Results

| Quantity | Before this refinement | After |
| --- | ---: | ---: |
| Encoded program instructions | 146,779 | 93,880 |
| Bits per instruction field | 18 | 17 |
| Program scalar binary digits | 10,568,107 | 6,383,858 |
| Program scalar decimal digits | 3,181,317 | 1,921,733 |
| Private witnesses per square | 35,134 | 23,426 |
| Private witnesses per natural predicate | 105,504 | 70,380 |
| Private witnesses per power-value recipe | 12,870,618 | 9,194,306 |
| Total rational variables, including input | 211,983,774,909 | 151,200,931,889 |

The scalar is now below T: its binary length is 6,383,858, whereas T has
6,447,724 binary digits. This does **not** make T a uniform bound for every
constructor degree: the scalar's division polynomials also enter, and ell
has its own bound. The separate analysis bound can nevertheless be lowered
from `U=2^32000000` to `U=2^20000000`; see the final section below.

## What the scalar represents

The constant at `metadata.programCodeNode` in the pinned precision source is
the code e of the precision register-machine program, including its Cantor
unpairing wrapper. The universal natural polynomial is specialized to this
program. The manuscript's section "Interpreter, lowering and five-input
specialization" specifies

`e+1 = 2^w (2D+1)`.

For positive w, instruction p consists of the four base-2^w digits of D at
positions 4p through 4p+3. Opcode 1 increments register r and jumps to a.
Opcode 2 decrements a positive register and jumps to a, or jumps to b if the
register is zero. Other opcodes halt; absent digits are zero. For w=0 the
program halts immediately. Initially register 0 holds the arbitrary natural
input and all other registers are zero.

`program-scalar.js` decodes the literal itself, so rebuilding does not require
the large research archive. It applies only the following transformations.

1. **Always-zero tests.** A register other than register 0 which is never
   incremented stays zero. Replace any test/decrement of it by its zero
   successor. There are 29,312 such instructions in the original program.
2. **Cancelling pairs.** An increment immediately followed by a decrement
   of the same register must take the nonzero branch. The pair leaves every
   register unchanged. Redirect entry to the pair to that branch's target.
   Other entries to the decrement instruction remain valid. There are seven
   such increment entries.
3. **Certified terminating tails.** The final virtual register values are
   not observed. The manuscript explicitly states that the universal
   interpreter enters its own cleanup after a virtual halt; the virtual
   final tape need not be zero. A straight path to a known terminating state
   terminates, as does a decrement whose two successors terminate. A loop
   `decrement r; if positive return here; else go to a terminating state`
   terminates because r decreases through natural numbers. Starting with
   halts, these rules certify 23,583 states, including the final register
   cleanup. Replace entry to any of them by a halt.
4. **Compact the encoding.** Thread the identity redirects, retain reachable
   instructions, and renumber states and registers, keeping input register
   0 fixed. A cycle of identity redirects becomes a divergent trap, never
   a halt. Reduce w to the width needed for the remaining fields.

The counts in the first three items overlap; they are not additive savings.
No general termination oracle, testing timeout, or unproved program identity
is used. The optimizer does not require that the precision algorithm be
correct: it preserves the decoded program's halting set on every natural
input, including on inputs where that program diverges.

### Simulation certificate

The optimizer supplies the original state represented by each compact state,
the register renaming, and an ordered list of certified terminating states.
The separate `verifySimulation` routine checks this correspondence locally:

- A terminating-state claim may use only earlier claims, explicit halts,
  or the decreasing self-loop rule above. Circular termination claims fail.
- Each retained state has the same opcode and renamed register. Its
  successors are the corresponding original successors after only the
  permitted identity rewrites or certified termination.
- Input register 0 is preserved; all other renamed registers start at zero.
- Redirect cycles are represented by an explicit nonhalting loop.

Consequently each retained step simulates finitely many original steps, with
the same register values. Skipped tails terminate on both sides, while a
closed redirect cycle diverges on both sides. This proves equality of the
halting sets, not equality of final tapes or running times. Re-encoding is
also checked by decoding the result and comparing every instruction.

The original precision source and its release hash remain unchanged on disk.
The optimized build creates a new in-memory source with this one literal
replaced. Its metadata nests the original source metadata rather than
attributing old wrapper hashes to the new program. The artifact records the
new source hash and both program-code hashes; its existing `sourceHashes`
continue to identify the original provenance. The independent source-wiring
audit uses the transformed source. Shrinking this literal alone does not
remove variables: the universal interpreter polynomial is still the same.

## Sharing the duplicated input in a square

Write A=iota(a), C=iota(c). The general multiplication predicate for
`multiply(A,A,C)` uses three root slots, even though its first two are equal.
For each root it supplies membership in the carrier, three homogeneous
coordinate quantities, and three slope certificates for each quantity.
Thus the two copies of A repeat the same nine-slope existential condition.

The new `square(A,C)` has two root slots and eighteen slope certificates.
It also computes `[cstar]A` once. Its four-point slope context is still

`([cstar]P0, [cstar]A, [cstar]A, [cstar]C)`.

Every slope predicate, test group and finite guard retains its original
definition. In particular the guard receives `(A,A,C)` and still excludes
false square triples in the finite box. Membership is imposed on both A
and C, so this is a globally typed square predicate, not just a shortcut
valid on an assumed carrier.

For soundness, copy the shared coordinates, slopes, membership witnesses
and scalar witnesses into both input slots of the old certificate. This
gives a valid general multiplication certificate. For completeness, start
with an old certificate for `(A,A,C)`. Its member conditions type A and C;
the fixed scalar relation has a unique output on the carrier. The two
scalar outputs for A therefore agree. Both coordinate/slope blocks have
the same parameters. Keep the first block for A and the block for C, and
discard the second copy. This gives the new certificate. This is the
elementary equivalence `(exists x F(x)) and (exists y F(y)) iff exists x F(x)`
applied to identical conjuncts with the same remaining parameters.

The exact saving per square is 11,708 variables:

- one scalar output point and its inverse witness: 6;
- one membership certificate: 7;
- homogeneous numerator/denominator variables and denominator inverse: 4;
- nine slope variables: 9;
- nine slope certificates, each with 1,298 witnesses: 11,682.

The translator uses the square predicate whenever the two operand point
references coincide, after the existing constant simplifications. This
includes 77 square operations in each power-value recipe and 54,052 in the
outer precision source. The natural predicate uses three such squares,
saving another `3*11708=35124` witnesses per natural-number test. Since a
power-value recipe has 79 private source variables, it saves

`77*11708 + 79*35124 = 3676312`

private witnesses. The outer precision predicate calls it 15,845 times.
Including all outer calls gives a total saving of **60,782,843,020 variables**.

`verifySquareStructure` compares every conjunction leaf in the specialized
height and outer square wrappers with the corresponding old formula after
identifying exactly these duplicate witnesses. It keeps the callee
predicates as contracts, checks all call arguments, and checks the witness
saving. The translator audit independently checks each source square's
operand identity and witness block. The degree traversal is unchanged:
sharing these conditions introduces no extra algebraic degree or large
coefficient.

## Overall bounds and verification

All optimized fixed literals have fewer than 1,922,000 decimal digits.
The exact small inequality `10^1000 < 2^3322` gives, for every such positive
scalar n,

`log2(128*n^3) < 7 + 3*3322*1922 = 19154659 < 20000000`.

This controls the original division-polynomial majorant at the index shapes
n, n+1, n-1 and 2n. The earlier independent estimates also give
`log2(ell)<13762228`, `log2(128*cstar^3)<481333`, and `T<2^6450000`.
Thus `U=2^20000000` bounds the constants and constructor degrees used by the
size traversal. The syntax-height bound remains 256 and the degree majorant
remains `32768U+8754752`. Hence

\[
\deg P<2^{20000016},\qquad
|[X^\alpha]P|\le 2^{2^{40960000000}}.
\]

The regenerated reports pin the expression hash, program lengths and hashes,
variable counts, independent bounds, and structural checks. Small-machine
fixtures additionally exercise zero tests, cancellation, register renaming,
halting tails and divergent cycles, including corrupted-certificate tests.
These verify the rewrites and assembly; they do not independently prove
the arithmetic inputs inherited from the original construction or replace
human review of those inputs.

Developed with ChatGPT/Codex at the repository owner's request. The dated
release artifacts are preserved; no completed Lean proof of these new
optimizations or of the full arithmetic theorem is claimed.
