# Optimized construction

This is a separately reproducible version of the November 5 construction. The
dated manuscript, saved expression, source manifest and original check suite
are unchanged. The optimized build starts from the pinned precision input
and replaces its program scalar by a checked equivalent program code.

Run from the repository root, with Python 3.11+ and Node.js 22+:

```sh
python scripts/check_optimized_construction.py --output build/optimized
```

This generates the full finite polynomial specification, its assembly report,
size bounds, degree comparison and finite-check report in the output directory.
The 21 MB generated expression is not duplicated in git; `expected-checks.json`
pins its exact hash and all deterministic check results. Without `--output`,
the check uses a temporary directory. The command fails on a digest, count,
degree-bound or finite-check mismatch. To regenerate without accepting a new
expected result:

```sh
node construction/optimized/build.js build/optimized
python construction/optimized/bounds.py build/optimized
python construction/optimized/degrees.py build/optimized
node construction/optimized/verify.js
```

## Results and scope

| Quantity | Dated construction | Current optimized construction |
| --- | ---: | ---: |
| Total rational variables, including input | 292,890,231,905 | 151,200,931,889 |
| Natural-predicate private witnesses | 140,604 | 70,380 |
| Power-value private witnesses | 17,786,698 | 9,194,306 |
| Square private witnesses | 35,134 | 23,426 |
| Multiplication private witnesses | 35,134 | 35,134 |
| Finite guard private witnesses | 1 | 1 |
| Field-degree bound D | `324!*3^(256*(324!)^4)` | 144 |
| Catalogue modulus W | about `7.7*10^130` | 56 |
| Catalogue size | about `1.6*10^131` | 1,080 |
| Catalogue maximum H | uniform progression bound | 10,321 (exact) |
| Cutoff upper bound | `2^(2^(2^9013))` | `2^6450000` |
| Precision source | Pinned release | Same circuit, equivalent compacted program code |

The reduction is 141,689,300,016 variables (48.3762%). The finite guard
reduces construction work, degree and coefficient-norm bounds using the same
one witness. No quartic conversion or three-copy multiplication correction
is used.

The current cutoff is the explicit integer

`T=(1344*10^19)^13 * 2^6444048 * 3^1716`.

It has 6,447,724 binary digits and 1,940,959 decimal digits. Both lengths and
its equality with the fixed-expression prescription are checked exactly.
The preceding merged version had W=185640, H=23150593 and a cutoff with
about 2.67 trillion decimal digits. The current improvements add no variables.

**Separate bounds remain necessary.** The original program scalar has
3,181,317 decimal digits. [Program compaction](program-and-square.md) reduces
it to 1,921,733 digits, now below T. Its division polynomials and the constant
ell still require separate bounds. The checkers use an
analysis bound `U=2^20000000` for the fixed scalars, division-polynomial
constructor degrees and T. It is not added to the polynomial as a coefficient.
The syntax-height bound 256 and degree traversal give

\[
\deg P\le32768U+8754752<2^{20000016},\qquad
|[X^\alpha]P|\le2^{U^{2048}}=2^{2^{40960000000}}.
\]

These are overall upper bounds, not exact degrees or claims of essential
variables. The interpolation guard itself still has degree at most 12T+3.
Large scalar constructors now dominate the reported overall degree bound;
reducing only T further would not improve that part of the construction.

The constants use F=D=144, G0=480, W=56, E0=24, R=H and
`Q=2^24*3^11*4^(2H)`. The [reserve-catalogue proof](prime-catalogue.md)
uses 45 primes per class and an exhaustively checked availability property
to avoid imposing congruences at most small primes. The 24 unit classes
supply only 1080 catalogue primes. P0 still contains all primes through 324.

The [current height proof](height-refinements.md) charges conductor exponents
24 at two, 11 at three, and at most two elsewhere. It applies Watkins's
unconditional class-number classification to the CM fibres and retains
the sharper genus bound in the modular-Jacobian transfer. The resulting
non-CM height estimate is `14000000*Q^12*M^24`, replacing `Q^17*M^24`.
The local logarithm precision and cutoff formula `T=(48*Aheight)^13` stay
unchanged. M, cstar and ell retain their formulas with the smaller catalogue.

The field/Hom and CM reduction-order arguments are in the now historical
[cutoff.md](cutoff.md). The first factorial-based optimization is preserved
in [cutoff-previous.md](cutoff-previous.md). Git history records the numerical
prescriptions between these versions.

These changes use the manuscript's arithmetic framework and the additional
published results and arguments identified in the supplements. The finite
checks do not independently establish the original global theorem, nor do
they reproduce Watkins's proof of completeness of his classification.

The [program and square refinement](program-and-square.md) explains the
checked program rewrites and shared square certificates. Relative to the
preceding optimized version, these remove a further 60,782,843,020 variables
and reduce the program scalar by 39.59% in decimal length.

## Constant arithmetic

On canonical point codes, multiplying the integer label by -1 negates the two
ordinate coordinates and preserves the other three coordinates. `raw_negate`
requires exactly those five linear equalities and has no private witnesses.
Multiplication by 2 uses one raw point addition. Multiplication by 0 or 1 and
addition of 0 use aliases, with no new equations or variables.

The source-DAG induction supplies the precondition: all source variables are
natural codes, except the three signed parameters of `power_value`, whose
caller supplies canonical codes. The fixed generator equations supply the
constant codes. Operations preserve canonical codes. Thus deleting a redundant
membership check formerly supplied by multiplication cannot admit an untyped
source input. Existing source operations that are not aliases remain conjuncts;
no live source variable or private power block is deleted.

The optimized recipe format is `model-evaluation-polynomial-recipe-v2`.
Operation tags 0, 1 and 2 keep their original meanings; tag 3 is the negation
call. Tag 4 is a square call with the same record shape and the specialized
square witness block. The tag-3 record is `[3, sourceNode, inputPoint, outputPoint, witnessStart]`.
Its witness block has length zero. `sourceNodePoints` remains diagnostic;
only the recorded equations and root equality define the rational polynomial.
An independent audit checks each alias and operation against the transformed source,
including operand order, exact constants, allocation coverage and root wiring.

The compiler still represents every nontrivial output by five coordinates.
This modest optimization does not introduce a new representation of point
coordinates, additional variable powers, or larger scalar constants.

## Three-square nonnegativity

For an integer n, Legendre's three-square theorem gives

\[
n\ge0\quad\Longleftrightarrow\quad
8n+3=x^2+y^2+z^2\quad(x,y,z\in\mathbb Z).
\]

For the forward direction, `8n+3` is positive and is not of the forbidden form
`4^a(8b+7)`. For the reverse direction it is nonnegative, so the integer n
is nonnegative. No separate oddness tests on x, y, z are required.

The replacement first imposes `member(N)`, then uses three globally typed
square calls to construct the three squares. Three raw doublings and
one addition construct `[8]N+[3]P0`; two additions sum the squares. The code
of `[3]P0` is computed by exact rational field arithmetic. Its four nonintegral
coordinates use globally conjoined denominator-clearing equations.

Witness accounting is explicit:

- membership: 7;
- three roots and three square codes: 30;
- three specialized square calls: `3*23426`;
- three doubling outputs: 15;
- target and partial-sum codes: 10;
- six addition calls: `6*6`;
- four fixed rational coordinates: 4.

Their sum is 70,380. In particular the membership check prevents accidentally
allowing a code for a nonintegral eighth-root label or an untyped point.

## The interpolation guard

Let `p_n=iota(n)` for `-T<=n<=T`, and put `N=2T+1`. For each n write its five
coordinates in reduced form `A_nj/B_nj`, with positive denominators, and define

\[
\begin{aligned}
D_n&=\prod_{j=1}^5 B_{nj},\\
d_n(X)&=\sum_{j=1}^5
\left(D_nX_j-(D_n/B_{nj})A_{nj}\right)^2,\\
D(X)&=\prod_{n=-T}^T d_n(X),\qquad
p_n^*(X)=\prod_{\substack{-T\le m\le T\\m\ne n}}d_m(X).
\end{aligned}
\]

Every `d_n` has integer coefficients, is nonnegative on rational tuples and
vanishes exactly at `p_n`. Injectivity of the point codes implies
`p_n^*(p_n)>0`. Reduce

\[
\frac{n}{p_n^*(p_n)}=\frac{a_n}{b_n},\qquad b_n>0,
\quad C=\prod_n b_n,\qquad
H(X)=\sum_n a_n(C/b_n)p_n^*(X).
\]

Thus `C` is a positive integer, `H` is an integer polynomial, and
`H(p_n)=Cn`. All these are fixed finite coefficients, not quantified integer
witnesses. Define the new guard equation, with just one rational witness u:

\[
\boxed{\bigl(H(X)H(Y)-CH(Z)\bigr)
       \bigl((D(X)+D(Y)+D(Z))u-1\bigr)=0.}
\]

**All-input equivalence.** If any of X, Y, Z is outside the finite point set,
the nonnegative sum `S=D(X)+D(Y)+D(Z)` is positive; choose `u=1/S`. This accepts
exactly as the old exclusion guard does in this case, even for noncanonical
or off-curve rational tuples. If all three are bounded point codes
`p_a,p_b,p_c`, then `S=0`, and the equation becomes `-C^2(ab-c)=0`. It accepts
exactly the true multiplication triples. Consequently the new and old guards
have identical projections onto all fifteen rational input coordinates.

At any fixed prescription, this replacement is justified at the guard
interface by the preceding argument. Changing the catalogue and cutoff
also uses the prime-pattern and height proofs in the companion supplements. For `T=0`, `H=0`
and the guard polynomial is identically zero, correctly accepting every tuple:
the bounded cube then contains no false triple.

**Complexity.** `D` has degree `4T+2` and `H` has degree at most `4T`.
The displayed polynomial consequently has degree at most `12T+3`. Its template
then squares it, just as the old template squares its inverse equation. The
old product has one quadratic factor for every false triple in a cube, hence
order `T^3` degree. Prefix/suffix products construct all omitted-factor
products with O(T) shared polynomial gates. Computing the rational weights
uses O(T^2) fixed point-distance evaluations, instead of enumerating O(T^3)
triples. These gate counts do not assert constant-time big-integer arithmetic.

`finite_guard_interpolation` denotes this entire displayed polynomial, with
the witness supplied explicitly as its last node argument. It is a new finite
constructor, not a relabeling of the old product. `interpolation-guard.js`
specifies its exact integer arithmetic and small-fixture materialization.

## Coefficient and degree bounds

Use the dated coordinate bound `K=2^30(T+1)^3`: the numerator and denominator
of every coordinate of `p_n`, `|n|<=T`, have magnitude at most `2^K`.
For T>=1 (so N>=3):

1. `D_n<=2^(5K)` and `||d_n||_1<=2^(10K+5)<=2^(11K)`.
2. Clearing a denominator dividing `D_n^2` shows that every nonzero
   `d_m(p_n)` has a rational representation with numerator and denominator
   at most `2^(21K)`. The two numerator terms before squaring are at most
   `2^(10K)`; summing five squared differences gives at most `2^(20K+5)`.
3. Both numerator and denominator of `n/p_n^*(p_n)` are at most `2^(22KN)`.
   Therefore `C<=2^(22KN^2)` and each integer weight `a_n(C/b_n)` has
   magnitude at most `2^(44KN^2)`.
4. Submultiplicativity gives `log2 max(1,||H||_1)<=56KN^2` and
   `log2 max(1,||H(X)H(Y)-CH(Z)||_1)<=113KN^2`.
   The other factor has log norm at most `14KN`.
5. The guard thus has log norm at most
   `128KN^2<=2^39(T+1)^5`.

For T=0 the zero polynomial satisfies the bounds directly. The old proof's
guard majorant was `2^39(T+1)^6`. This improves the coefficient-norm upper
bound as well as degree, with no extra variables. It does not assert that
each individual coefficient is smaller than a corresponding old coefficient.

For the current prescription, [height-refinements.md](height-refinements.md)
proves T+1<U=2^20000000 and bounds all the fixed coefficients and occurring
scalar constructor degrees by U. The guard's degree and log norm therefore
fit the same constructor majorants U^4 and U^8. The wrapper coordinates also
satisfy the checked literal bound. `bounds.py` traverses the actual expression
and verifies the unchanged root-height majorant 256, now using B<=U rather
than incorrectly retaining B=T+1. Standalone generator and root equations
have height four, as in the preceding optimized version.

`degrees.py` verifies that scalar indices have the prescribed shapes n,n+1,
n-1,2n, where n is cstar or a positive extra scalar. The dated column uses
its original T_dated; the optimized column uses U, including T<=U for the
guard. The resulting majorants are

\[
\begin{aligned}
\deg P_{\rm dated}&\le110592T_{\rm dated}^3+32768T_{\rm dated}+8754752,\\
\deg P_{\rm optimized}&\le32768U+8754752.
\end{aligned}
\]

Addition takes a coefficientwise maximum of majorants, multiplication adds
degrees, and substitution multiplies degree bounds, including degree-one
private witnesses. Conjunctive recipes double the maximum degree; product
recipes add the degrees. This does not expand the full polynomial.

## Verification and provenance

`verify.js` checks all triples with labels from `[-T-1,T+1]` for T=0,1,2,
including zero and negative indices, against the exact new polynomial.
It also checks off-carrier rational tuples, evaluates selected original
literal products independently, and checks the degree of each fixture.
The source arithmetic tests cover both operand orders and alias propagation;
coordinate perturbations must fail negation. The three-square wrapper is
evaluated with exact contract oracles for the inherited member/add/square
predicates, including invalid input and fixed-coordinate rejection cases.
These oracles do not purport to evaluate the astronomical multiplication
certificate. Negative structural tests corrupt operations, natural guards,
cutoff bindings and the shared shift.

`verify-cutoff.js`, included in the same suite, rechecks the finite level
group, branch discriminants, transitive centralizer examples, formal-depth
fixtures, GL2(F5) count, local conductor bounds, CM inequalities, the refined height transfer,
exact binary cutoff and separate scalar bounds.
It also runs the complete catalogue sieve and residue-sum checks in
`prime-catalogue.js`, and exact small-field point counts in
`verify-reduction-orders.js`. It rejects altered constants and catalogue/multiplier bindings.
These are finite checks accompanying `height-refinements.md`; they do not constitute
machine verification of the geometric, Galois or class-number arguments.

`verify-program-and-square.js` checks the shared-certificate wiring, small
program fixtures and corrupted simulation certificates. Full-program local
simulation checking runs during construction, as described in
[program-and-square.md](program-and-square.md).

`build.js` checks the original expression and precision input hashes, performs
the optimized translation, and reconstructs the five outer compositions from
the original wiring. `audit.js` independently checks source operations and
all witness partitions. The generated JSON carries complete constructor and
operation semantics, rather than relying on this prose to interpret a tag.

The baseline source files are hash-checked before running this suite. CI runs
both suites. The large generated expression can be reproduced exactly from
the committed sources and compared with the pinned expected SHA-256.

These changes and accompanying arguments were developed with ChatGPT/Codex
at the repository owner's request. The verification described here is automated
finite checking and mathematical equivalence reasoning, not independent human
review or a completed Lean formalization of the new or original construction.
