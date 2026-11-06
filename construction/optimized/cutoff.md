# A 144-degree field and a smaller prime-support bound

The optimized construction now prescribes

\[
F=D=144,\quad G_0=480,\quad E_0=866,\quad
R=\max(D,H_{\max}^3,10^{12}).
\]

The catalogue, least formal multiplier M, cstar=4M, pole-clearing constant
ell, and formula `T=(48*Aheight)^13` keep their definitions. Q, Aheight and
T use the new constants. No witnesses or fixed-expression operators are
added. The dated construction is unchanged. The earlier optimization is
preserved in [cutoff-previous.md](cutoff-previous.md).

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

## 4. Bound the prime support of cstar, rather than its value

Let H=Hmax and Ns be the unchanged catalogue/small-prime product. The
manuscript constructs `k=Ns^4*m0` passing the formal-depth condition, where
m0 is a product of actual reduction orders at odd places dividing Ns.
Those orders are at most p^3 for places over p (including the stated
singular reduction at seven). Thus every prime factor of k is at most H^3.

We need divisibility `M|k`, not just the manuscript's inequality `M<=k`.
This follows because the accepted multiples form a subgroup. Here are the
local details, including the ramified prime two.

The ring of integers of Q(sqrt(2)) is Z[sqrt(2)]. For a normalized common
denominator expression `1/x=(a+b*sqrt(2))/c`, the code's conditions
`Ns^4|a`, `Ns^4|b`, and `gcd(c,Ns)=1` are equivalent to
`1/x in Ns^4 O_v` at every place v above primes dividing Ns. If
e_v=v(p) and a_p=v_p(Ns), this means `v(1/x)>=4 e_v a_p`.

The displayed elliptic equation is integral at every place. Negative
abscissa valuation places a point in its formal subgroup, where
`z=-x/y` satisfies `v(1/x)=2v(z)`. The condition is therefore exactly
membership in the formal subgroup `v(z)>=2 e_v a_p`, including the
identity. These formal filtrations are subgroups, also at two where
e_v=2. The accepted points form their intersection. Its inverse image
under the homomorphism `n -> [n]P0` is a subgroup MZ of Z. Existence follows
from the already constructed k, and the least positive accepted index M
therefore divides k. The manuscript's dyadic-formality argument ensures
the reciprocal is defined at each nonidentity search step.

As cstar=4M, every prime divisor of cstar is at most H^3. All other primes
in S_mul are at most H. Thus it is valid to replace the old R prescription by

\[
\boxed{R=\max(D,H^3,10^{12}).}
\]

No catalogue primes, multiplier, or pole certificate have changed. We only
use a sharper bound for the same bad-prime set in the height estimate.

The class 1 modulo W contains no prime of the form 1+0W. Its 22nd prime
is at least 1+22W, so H>22W. Since W has 435 bits, H>10^12 and H>D.
Consequently the new prescription satisfies **R=H^3, not R=D**.

## 5. An explicit cutoff bound and all fixed scalar indices

Use BMOR Corollary 6.17 with parameter A=2, as in the earlier supplement:
for `x>=exp(.06 sqrt(W) (log W)^3)`, its unconditional theta error is
at most `x/(160(log x)^2)`. See the
[published author PDF, p. 507](https://personal.math.ubc.ca/~bennett/BeMaObRe-IJM-2018.pdf).
Here `2^434<W<2^435`. Take `X=2^(2^240)` for this estimate only.
From `1/2<log 2<7/10`,

\[
\log W<305,\quad
.06\sqrt W(\log W)^3<.06\,2^{218}305^3<2^{239}<\log X.
\]

Also `160*(log X)^2>2W`. Thus theta(X;W,a)>X/(2W), and
`pi(X;W,a)>X/(2W log X)>22`. This proves H<X for the same catalogue;
no prime at most 324 belongs to a unit class and X is composite. Hence

\[
\log_2R=3\log_2H<3\cdot2^{240}.
\]

The CM comparison still gives `Ccm<2^(50000D^2)<Q^17` for D=144 and
R=H^3>10^12. Therefore

\[
T=(96\cdot10^{13})^{13}R^{221E_0R}
 =(96\cdot10^{13})^{13}R^{191386R}.
\]

Since `191386<2^18` and `log2((96*10^13)^13)<1024`,

\[
\log_2T<2^{3\cdot2^{240}+261}<2^{2^{242}},\qquad
\boxed{T<2^{\,2^{\,2^{242}}}}.
\]

Small D does **not** bound cstar or the source literals. We recheck their
size separately, rather than retaining the former `index<=2D+1` claim.
There are at most 22W catalogue primes, so
`Ns<=H^(22W+1)`. The unchanged proof `M<=Ns^10` yields
`cstar<=H^(230W)`. Similarly `ell<=H^(17000W)`. From H>22W and

\[
T=(96\cdot10^{13})^{13}H^{574158H^3},
\]

both constants, and the other fixed constants below Aheight, are smaller
than T. For a division index j coming from cstar, `|j|<=2*cstar+1`, so

\[
\deg\psi_j\le2(|j|+1)^3\le128\,c_*^3
 <H^{690W+1}<H^{33H}<T.
\]

All extra scalar literals have fewer than 20 million binary digits, checked
by `bounds.py`. For those indices, `128*n^3<2^(60000007)`, whereas
`log2 T>R>2^1302`. The small rational coordinates used by the three-square
wrapper also fit this literal bound. Thus their division polynomials have
degree below T as well. Fixed constants and coefficient expressions still
fit B=T+1, using the original recurrence norm estimates.

The height/false-triple proof, with the revised field, conductor and prime
bounds, excludes every false triple outside [-T,T]^3. The interpolation
guard excludes those inside it. Equivalence of the full multiplication
predicate follows; guards at different cutoffs are not equivalent on all
rational inputs in isolation.

The final optimized polynomial still satisfies

\[
\deg P\le32768T+8754752,\qquad
\deg P\le(T+1)^{2048},\qquad
|[X^\alpha]P|\le2^{(T+1)^{2048}}.
\]

In particular degree is below `2^(2^(2^243))`, and coefficients are below
`2^(2^(2^(2^243)))`. Total variables remain 211,983,774,909.

## Verification and remaining scope

`verify-cutoff.js` checks the finite level-group count, branch discriminants,
centralizer examples, small formal-depth fixtures, conductor arithmetic,
catalogue inequalities and corrupted-prescription rejection. The complete
construction is regenerated and compared to pinned reports. These checks
do not machine-formalize the geometric, Galois or formal-group proofs above.
Original source hashes and dated artifacts are preserved. The arguments and
implementation were developed with ChatGPT/Codex at the repository owner's
request; no independent human review is claimed.

There is no asserted optimality of D=144. A smaller D would require sharper
information about the particular cover's arithmetic action or a different
field of definition. For the present cutoff, Hmax is now the dominant
constant. Further reductions of D alone change the finite height factors,
but not the leading tower scale coming from the catalogue estimate.
