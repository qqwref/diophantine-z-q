# Previous cutoff: the 144-degree field and CM reduction orders

**Historical supplement:** [height-refinements.md](height-refinements.md)
supersedes the numerical prescriptions in sections 3, 5 and 6 below. The
field/Hom arguments in sections 1-2 and prime-support argument in section 4
are reused. The catalogue now follows [prime-catalogue.md](prime-catalogue.md).

This previous version prescribed

\[
F=D=144,\quad G_0=480,\quad E_0=866,\quad
W=185640,\quad R=\max(D,H_{\max}),\quad Q=4^{RE_0}.
\]

The smaller catalogue is proved in [prime-catalogue.md](prime-catalogue.md).
Its maximum is exactly H=23150593. P0 still contains every prime through 324;
M, cstar=4M, ell and `T=(48*Aheight)^13` keep their formulas, evaluated with
the new catalogue. No witnesses or fixed-expression operators are added.
The dated construction is unchanged. The first cutoff optimization is
preserved in [cutoff-previous.md](cutoff-previous.md); git history preserves
the intervening `R=H^3` version.

These arguments use the manuscript's stated geometric and arithmetic
inputs. The new implications and numerical estimates are proved below;
they are not an independent verification of the manuscript's main theorem.

## 1. Remove the factorial from the fibre field

### The exact model and action over Q

Use the manuscript's quaternion algebra B=(2,-3), maximal order O, and
principal-polarization datum mu=2j+ij. On the left B-module V=B, the form
`Trd(mu^-1 x conjugate(y))` is multiplied by nrd(b) under right multiplication
by b. Its group of B-linear similitudes is therefore `(B^op)^*`, identified
with B*. This is the quaternionic PEL datum underlying the full-three
moduli problem in the manuscript.

At three, the Tate lattice is free of rank one over O_3, as proved in the
manuscript. The same division-valuation argument works at two; at split
primes the assertion follows from the module description for M2(Z_p).
A marking `O/3O -> A[3]` is exactly an orbit of integral Tate
trivializations modulo `K3=ker(Ohat^* -> (O/3O)^*)`: unit lifts at three
exist, and maximal level is imposed elsewhere. Thus this moduli problem
has level K3, with **all** determinant components, rather than one component
with a selected value of the Weil pairing. The polarization and O-action
are the same data used to construct X35 and descend it by the five-marking
group. That descent represents this very functor; it is not an unspecified
Q-form of the complex curve.

For the primary-source identification, Milne's *Introduction to Shimura
Varieties*, Example 12.4(d), gives reflex field Q for this quaternion algebra
over Q. The PEL discussion on p. 126 identifies the moduli Galois action
with the canonical model. Theorem 13.6 makes right translations by adelic
elements rational over that reflex field. Apply it at K=K'=K3 to each
element of its normalizer N. These translations are automorphisms of the
same full-three moduli model over Q. The description at the ramified prime
three uses the Tate-lattice argument above, not an application of Buzzard's
integral theorem outside its allowed level hypotheses.

References: [Milne, pp. 112, 118, 126](https://www.jmilne.org/math/xnotes/svi.pdf);
[Buzzard, sections 1-2](https://www.ma.imperial.ac.uk/~buzzard/maths/research/papers/shimura.pdf)
for the moduli and level conventions used by the manuscript.

The manuscript proves that central finite ideles act trivially. Its finite
normalizer action therefore factors through `N/(Af^* K3)`. The 81-element
order modulo three has 72 units. Dividing by the distinct central signs
and including the four normalizer cosets gives order at most

\[
4\cdot(72/2)=144.
\]

The geometric quotient is the manuscript's genus-zero j-line. This is also
the quotient over Q: its three branch points have distinct indices 4,6,2,
so each is rational, and the unique coordinate assigning them
`0,infinity,-16/27` is rational. It agrees with the normalized j-coordinate.

### Splitting a fibre

For a transitive group action on a set S of m points, any permutation
commuting with the group is determined by the image of one fixed point:
`c(g*s)=g*c(s)`. Its centralizer in Sym(S) consequently has at most m
elements. If the action is defined over Q, the Galois action on a rational
fibre commutes with it. The fibre splitting field therefore has degree at
most m, not m!. This does not require a free action or a connected cover.

For admissible rational u, the manuscript's `j=J(u)` avoids all three branch
values. F(u) is nonzero; G has discriminant -10800; and
`G^6-97200F^2=H^2`, where the three quadratic factors of H have discriminants
10800, 43200, 43200, all nonsquares. Thus j is finite, nonzero, and not
-16/27. Near this fibre the pulled-back cover is etale, so normalization
does not change it. The transitive Q-defined normalizer action therefore
acts on exactly the fibre used to define K in the manuscript. It follows that

\[
K/\mathbb Q\text{ is normal},\qquad [K:\mathbb Q]\le144.
\]

The normalized-cover ramification argument is unchanged, retaining all
excluded primes through 324. It still makes K unramified outside
`S union supp(M_S(u))`.

## 2. Full three-torsion already defines every Hom group

Here is an elementary lemma that eliminates the former Hom-field extension.
If abelian varieties A and B over a characteristic-zero field k have all
their three-torsion points k-rational, then every geometric homomorphism
`A -> B` is defined over k.

Indeed, restriction to torsion gives a Galois-equivariant injection

\[
\operatorname{Hom}(A_{\bar k},B_{\bar k})/
3\operatorname{Hom}(A_{\bar k},B_{\bar k})
\hookrightarrow \operatorname{Hom}(A[3],B[3]).
\]

To check injectivity, a homomorphism vanishing on A[3] factors through the
quotient map `[3]:A -> A`, so it is three times another homomorphism.
The right side has trivial Galois action. The Hom group is a finite-rank
free Z-module and its Galois image is finite (choose a finite basis and a
finite extension defining every basis map). That finite image lies in the
kernel of reduction `GL_r(Z) -> GL_r(F3)`, which is torsion-free. Hence
the image is trivial.

For completeness, the last fact follows by taking an element of prime
order in any nontrivial finite subgroup and writing it as `I+3^a B`, with
a>=1 and B nonzero modulo three. If its prime order is not three, the
first term of the binomial expansion cannot vanish modulo `3^(a+1)`.
If the order is three, the first term has valuation a+1 and all remaining
terms have larger valuation. Both cases are impossible.

The universal three-marking on the fine full-three moduli scheme gives
`A[3] = (O/3O)_K`, a constant group scheme. Since K is normal, each conjugate
A_i is K-defined and also has full rational three-torsion. The lemma applies
to **every ordered pair** A_i,A_j. Thus all blocks of the endomorphism
lattice of `Res(K/Q) A` are fixed by G_K. For the manuscript's kernel
field E, we have E contained in K, so its original field L=EK is just K.

Consequently the valid uniform bound is

\[
\boxed{D=144.}
\]

Normality and the ramification statement are preserved, and all conjugacy
homomorphisms needed later are defined. Neither the 51840 automorphism
bound nor an auxiliary quadratic endomorphism-field extension is needed.

## 3. Reduce the torsion and conductor constants

At five, `O/5O` is M2(F5). The four-dimensional A[5] is the sum of two
copies of its two-dimensional simple module. Its commuting automorphism
group is GL2(F5), of order `(25-1)(25-5)=480`. Galois over K commutes with
the K-defined O-action, so `[K(A[5]):K]<=480`. Use G0=480 instead of the
generic GL4(F5) bound. At primes other than three, A[3] is already rational
over K, so no torsion-field extension is needed for Raynaud's criterion.

Moreover, K(A[5])/Q is normal. The manuscript proves that every conjugate
of A is geometrically polarized-isomorphic to A. Section 2 makes those
isomorphisms K-defined. They identify the fields generated by the
five-torsion of A and any conjugate, so every Q-conjugate of K(A[5]) equals
K(A[5]). Its degree is at most `144*480=69120`.

For a **normal** local extension of degree a, the manuscript's different
calculation bounds its last positive upper break by
`2*(1+log2(a))`; the detour through a normal closure of degree a! is
unnecessary. Since 69120<2^17, all torsion-extension breaks are below 36.
For K alone, the same bound is below 18. Raynaud's criterion and the
manuscript's Tate-module argument therefore kill the relevant wild action
above 36 at every prime.

The remaining character beta is unchanged. At odd primes its restriction
to G_K is tame. At two the existing unit/logarithm argument bounds its
relative break by 3e, where e<=144, hence by 432. Above the last break of
K_v/Q_2, the subgroup formula has `psi(u)>=u`; beta is therefore trivial
on absolute upper groups with u>432. On these groups the isogeny cocycle
is trivial too. We can take a common absolute break bound U0=432 and hence

\[
\boxed{E_0=2+2U_0=866.}
\]

This replaces `10*(D*G0)^2`, not merely its numerical arguments. It uses
the same conductor proof with the normality just established. For p>R,
the original tame exponent bound two remains valid since R>=D. No changes
are made to the modularity, CM, isogeny, or theta-height inputs.

## 4. The reduction orders have no prime factors exceeding p

Write d=75-53*sqrt(2). The curve is `E: y^2=x^3-d^2*x`, a quadratic
twist of `E_base: y^2=x^3-x`. At a good place above an odd rational prime p,
the residue degree is one or two. We claim that **every prime divisor of the
reduction group order is at most p**, even when that order is of size p^2.

For residue degree one, full rational two-torsion makes the order divisible
by four. Hasse gives `#E <= p+1+2*sqrt(p) < 4p`. Each odd prime divisor is
therefore at most `#E/4 < p`; the prime two is smaller than p as well.

For residue degree two, E is a quadratic twist of E_base over F_(p^2).
If p=3 modulo 4, pairing x with -x in the Legendre-symbol point count gives
trace zero for E_base over F_p. Its squared Frobenius has trace -2p, so
the two twist orders over F_(p^2) are `(p+1)^2` and `(p-1)^2`. Since p+1
and p-1 are even, their prime factors are at most p.

If p=1 modulo 4, use exactly the manuscript's Gaussian-integer Frobenius
argument: the automorphism `(x,y)->(-x,iy)` commutes with Frobenius, whose
integrality then gives `pi=a+bi`, with `a^2+b^2=p`. Over F_(p^2) its trace
is `2(a^2-b^2)`. Negating this trace gives the quadratic twist. The two
possible group orders factor as

\[
\begin{aligned}
p^2+1-2(a^2-b^2)&=(p+1-2a)(p+1+2a),\\
p^2+1+2(a^2-b^2)&=(p+1-2b)(p+1+2b).
\end{aligned}
\]

Each factor is positive and even, and at most `p+1+2*sqrt(p)`. For p>=7
this is less than 2p, so its prime divisors are at most
`max(2,(p+1+2*sqrt(p))/2) < p`. The remaining p=5 gives orders 20 and 32,
whose prime divisors are at most five. The p=3 case was already covered.
This proves the claim for all odd good primes. The only bad odd place is
one of the places above seven; its nonsingular group has order seven, as
in the manuscript. The other place over seven is good. Two is handled by
the existing formal-group argument and contributes only the prime two.

`verify-reduction-orders.js` independently counts points on the actual curve
over every residue field above odd p<=101, including the inert quadratic
fields. It checks the factorization alternatives and the prime-factor bound
on 36 reductions. These fixtures supplement the general argument above.

### Pass from reduction orders to the least formal multiplier

The manuscript constructs `k=Ns^4*m0` passing the formal-depth condition,
where m0 is a product of actual reduction orders at odd places dividing Ns.
The preceding result shows that every prime factor of k is at most H:
all rational primes dividing Ns are at most H, since H>324.

We need divisibility `M|k`, not just the manuscript's inequality `M<=k`.
This follows because the accepted multiples form a subgroup. The ring of
integers of Q(sqrt(2)) is Z[sqrt(2)]. For a normalized common denominator
expression `1/x=(a+b*sqrt(2))/c`, the code's conditions `Ns^4|a`, `Ns^4|b`
and `gcd(c,Ns)=1` are equivalent to `1/x in Ns^4 O_v` at every place above
primes dividing Ns. With e_v=v(p) and a_p=v_p(Ns), this is
`v(1/x)>=4 e_v a_p`.

The equation is integral. Negative abscissa valuation places a point in its
formal subgroup, where z=-x/y satisfies `v(1/x)=2v(z)`. The condition is
exactly membership in `v(z)>=2 e_v a_p`, including the identity. These
formal filtrations are subgroups, also at two where e_v=2. The accepted
points form their intersection. Its inverse image under `n -> [n]P0` is
a subgroup MZ of Z. Existence follows from k, so its least positive index
M divides k. The manuscript's dyadic-formality argument ensures the
reciprocal is defined at every nonidentity search step.

Thus every prime divisor of cstar=4M is at most H. All other primes in S_mul
are at most H as well. We may therefore take `R=max(D,H)`. The new catalogue
has H=23150593>D=144, so **R=H**.

## 5. Replace the primorial estimate and remove the artificial floor

The height proof uses `R^R` to bound the product of primes at most R.
The elementary bound

\[
\prod_{p\le n}p<4^n\qquad(n\ge1)
\]

is enough to replace this throughout by `4^R`. Here is a proof to keep the
constant explicit. Induct on integer n. The cases n=1,2 are immediate.
If n>=4 is even, n is composite and the product equals that for n-1.
If n=2m+1 is odd, every prime m+1<p<=2m+1 divides `binom(2m+1,m)`.
This binomial coefficient is at most `2^(2m)`, because the two equal
central coefficients are terms in a row summing to `2^(2m+1)`.
Induction gives a product less than `4^(m+1)*2^(2m)=4^n`.

Set

\[
\boxed{Q=4^{RE_0}.}
\]

The character construction now gives `m<=2*4^R*M`, and consequently
`[L':Q]<=4D*4^R*M<=Q*M`: indeed `4D=576<4^5` and
`5+R<=866R`. The conductor estimate becomes
`N<=product(p<=R)p^E0*M^2<=Q*M^2`. These are the two places where
R^R occurred. All subsequent estimates depend on Q, M, and D through
these inequalities.

The former R>=10^12 requirement is sufficient but unnecessary. The actual
uses are the preceding field-degree domination and Q>=10^12 in the
modular-Jacobian/isogeny estimates. Both hold for this prescription.
In fact H>22W=4084080, so `Q=4^(866H)>10^12`. Also

\[
\log_2 Q^{17}=34\cdot866H>50000\cdot144^2,
\]

so Q^17 dominates the unchanged CM bound `Ccm<2^(50000D^2)`.
The original tame-conductor argument only needs R>=D and R>=max(S),
already proved above. This checks the height estimate with the new Q and
without the floor 10^12, rather than applying its stated old constants
outside their hypotheses.

## 6. Explicit T and fixed scalar indices

With D=144, E0=866 and H=23150593, the maximum defining Aheight is Q^17.
The same cutoff formula now gives the explicit integer

\[
\boxed{T=(96\cdot10^{13})^{13}\,2^{8861398783796}.}
\]

Here `8861398783796=442*866*23150593`. In particular

\[
\log_2 T<1024+8861398783796<2^{44},\qquad
\boxed{T<2^{\,2^{44}}}.
\]

The expression has about 2.668 trillion decimal digits. This is an explicit
formula for T, not a claim that its digits or the full polynomial have been
materialized. The catalogue maximum, unlike T, has been computed exactly.

All fixed scalar bounds need rechecking, because cstar and ell are much
larger than D and R. There are 66 primes in P0, and 811008 catalogue primes,
all at most H. Hence `Ns<=H^(811008+66)<H^(22W)`. Retaining the manuscript's
`M<=Ns^10` proves `cstar<=H^(230W)`. Likewise the unchanged formula
`ell=12*P0^2916*Hproduct^732` gives `ell<=H^(17000W)`.
Since H<2^25, the exact integer inequalities

\[
25\cdot17000W<8861398783796,\qquad
25(690W+1)<8861398783796
\]

show ell<T and, for every division index j from cstar,

\[
\deg\psi_j\le2(|j|+1)^3\le128c_*^3
 <H^{690W+1}<T.
\]

The index shapes are still `cstar`, `cstar+1`, `cstar-1`, and `2*cstar`.
Every extra literal has fewer than 20 million binary digits, as checked
by bounds.py. Its corresponding division-polynomial degree is bounded by
`128*n^3<2^60000007<T`. The same argument bounds the new three-square
wrapper coordinates. The other fixed constants are below Aheight or covered
by the estimates above, so the existing B=T+1 syntax bound remains valid.

The changed catalogue is justified by prime-catalogue.md; the height and
false-triple proof now excludes every false triple outside [-T,T]^3.
The interpolation guard excludes those inside. This proves equivalence of
the full multiplication predicate under the manuscript's other inputs.
Guards at different cutoffs are not equivalent in isolation on all tuples.

No variable count or template degree formula changes:

\[
\deg P\le32768T+8754752,\qquad
\deg P\le(T+1)^{2048},\qquad
|[X^\alpha]P|\le2^{(T+1)^{2048}}.
\]

Convenient absolute bounds are degree below `2^(2^45)` and coefficient
magnitude below `2^(2^(2^56))`. The total variable count remains
211983774909. All these are majorants, not exact degrees or heights.

## Verification and provenance

The full suite checks every catalogue residue class and its exact maximum,
the exceptional residue sums, actual reduction orders at small primes,
finite level-group counts, branch discriminants, transitive centralizer
examples, formal-depth fixtures, conductor arithmetic and the above integer
inequalities. Mutations to the prescribed constants are rejected. The complete
construction is regenerated and compared to pinned reports, while the 25
original source hashes and dated artifacts are preserved.

These tests do not machine-formalize the geometric, Galois, formal-group or
prime-pattern arguments, or independently certify the manuscript's main
claim. The arguments and implementation were developed with ChatGPT/Codex
at the repository owner's request; no independent human review is claimed.
Neither W=185640 nor D=144 is asserted optimal. The remaining height bound
has log(T) proportional to H; a substantial further improvement would need
a smaller catalogue, a tighter conductor product, or a sharper height input.
