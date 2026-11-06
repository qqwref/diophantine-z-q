# Smaller field bounds and cutoff

This supplement changes only the optimized prescription. It retains the
manuscript's arithmetic inputs, its primes through 324, its prime catalogue,
its least formal multiplier, and the formula `T=(48*Aheight)^13`. In
`constants.js` the replacements are

\[
F=144!,\qquad J=51840,\qquad D=2FJ^{F-1}.
\]

All subsequent constants use this new D. This is a bound for the same field
constructed in the manuscript, not a different field with unproved
ramification properties. In particular, changing a guard's cutoff alone
would not justify the optimization: the height argument must be rerun with
the improved field bound, as below.

## 1. The cover has degree at most 144

The six-contact proof in `diophantine_zq.tex`, starting with the definition
of K0 and K3, bounds the normalizer quotient outside the level group by four.
The displayed maximal order modulo three has 81 elements, of which 72 are
units. The original `verify-six-contact.js` already checks these counts by
exhausting the multiplication table, and also checks that 36 units have norm
one. Equivalently, the local order has residue field F9 and a radical of
size nine, giving `(9-1)*9=72` units.

The manuscript proves that central finite ideles act trivially on the entire
level-three curve, including its determinant components. The two central
units +1 and -1 have distinct reductions modulo three. Thus

\[
|K_0/((K_0\cap\mathbb A_f^*)K_3)|\le72/2=36,
\qquad [N:\mathbb A_f^*K_3]\le4\cdot36=144.
\]

The quotient degree is therefore at most 144. Normalizing a base change does
not increase its generic degree. The finite etale fibre used in the proof
has at most 144 points, so its splitting field K is normal of degree at most
144!. The original unramifiedness argument still applies: we retain the
larger excluded set of primes through 324. No claim that the splitting field
has degree at most 144 is needed here.

## 2. Bound the Hom field using its actual factors

Write n=[K:Q], and enumerate the conjugates of A/K as
`A_1=A, A_2, ..., A_n`, including their principal polarizations. Normality
of K makes all these polarized varieties K-defined. The manuscript proves
that they have the same geometric polarized moduli point. Choose polarized
geometric isomorphisms `phi_i:A_1 -> A_i`, with `phi_1=id`.

Let W0=Res(K/Q) A, E the kernel field of the Galois action on End(W0 over Qbar),
and L=EK, exactly as in the original proof. Over Qbar,

\[
W_0\simeq\prod_{i=1}^n A_i,\qquad
\operatorname{Hom}(A_i,A_j)
 =\phi_j\operatorname{End}(A_1)\phi_i^{-1}.
\]

For sigma fixing K, its action on the whole endomorphism lattice is therefore
determined by its action on End(A_1) and its images of the n-1 chosen phi_i.
This counts a finite image; it does not assume that the set of choices is a
direct-product Galois group.

There are at most two actions on End(A_1). The O-action is defined over K,
so Galois fixes B=O tensor Q pointwise. By the geometric classification in
the six-contact proof, End^0(A_1) is either B or M2(k), with k imaginary
quadratic. In the first case everything is fixed. In the second case B and
the centre k generate the whole algebra: `B tensor_Q k -> M2(k)` is an
isomorphism (the map is injective by simplicity and both dimensions over Q
are eight). An automorphism fixing B is thus determined by its restriction
to k, giving at most two choices. Its action on the integral endomorphism
lattice is determined by its action on this rational algebra. This argument
uses the classification geometrically, before passing to the Hom field;
there is no assumption that the endomorphisms are already K-defined.

For each i, sigma(phi_i) lies in the finite torsor of polarized isomorphisms
from A_1 to A_i. Its size is |Aut(A_1,lambda_1)|. This group is finite, acts
faithfully on integral first homology, and preserves the unimodular
alternating pairing of the principal polarization. Reduction modulo three
is injective on finite subgroups, by the same torsion-free level-three lemma
used in the manuscript. Consequently

\[
|\operatorname{Aut}(A_1,\lambda_1)|
\le|\operatorname{Sp}_4(\mathbb F_3)|
=3^4(3^2-1)(3^4-1)=51840=J.
\]

It follows that

\[
[L:K]=|\rho(G_K)|\le2J^{n-1},\qquad
[L:\mathbb Q]\le2nJ^{n-1}\le2FJ^{F-1}=D.
\]

Normality is retained because L is still EK for the original kernel field E.
At every prime outside the manuscript's set S union supp(M_S(u)), K is
unramified and each conjugate has good reduction. Inertia acts trivially on
the appropriate Tate module and hence on the endomorphism lattice of W0.
The original argument therefore still proves that L is unramified there.
It still defines every ordered conjugacy Hom group, not just End(A).

The downstream CM, modularity, conductor and isogeny estimates use this
degree bound and these field properties. Their formulas remain applicable
with the smaller D. The dimension of the Weil restriction is no longer
used as a proxy for an arbitrary integral Galois representation.

## 3. Check the catalogue does not become the dominant constant

The manuscript's coarse catalogue estimate alone is insufficient to prove
R=D for this new D. Use the same primary source with parameter A=2 instead
of A=1: Bennett--Martin--O'Bryant--Rechnitzer, *Explicit bounds for primes in
arithmetic progressions*, Corollary 6.17, published p. 507
([author PDF](https://personal.math.ubc.ca/~bennett/BeMaObRe-IJM-2018.pdf)).
For q>=10^5 and x>=exp(0.06 sqrt(q) (log q)^3), it gives

\[
|\vartheta(x;q,a)-x/\varphi(q)|
\le \frac{x}{160(\log x)^2}\quad ((a,q)=1).
\]

This is the unconditional version, including possible exceptional zeros.
Here W=4 product(p<=324) has exactly 435 bits. Set `X=2^(2^250)` only for
this estimate; it does not replace the catalogue in the polynomial.
Using `1/2<log 2<1`,

\[
0.06\sqrt W(\log W)^3
 <2^{-4}2^{218}2^{27}=2^{241}<\log X,
\qquad
\frac1{160(\log X)^2}<\frac1{2W}.
\]

Hence theta(X;W,a)>X/(2W), and the number of primes in each unit class is
greater than X/(2W log X)>22. None of these primes can be at most 324;
X itself is composite. Keeping the same first 22 primes per class gives

\[
H_{\max}<X,\quad
\log_2H_{\rm cat}<22W2^{250}<2^{690},\quad
\log_2N_s<2^{691}.
\]

The existing formal-group argument M<=Ns^10 then implies

\[
\log_2 c_*<2+10\cdot2^{691}<2^{695}.
\]

Similarly, for the unchanged pole-clearing constant,
`log2 ell < 4+2916*435+732*2^690 < 2^700`.

Exact integer inequalities give

\[
2^{829}<144!<2^{830},\qquad
2^{829}<\log_2D<831+16F<2^{834}.
\]

Thus D exceeds Hmax, cstar, ell, every explicit scalar literal, and 10^12.
In particular the unchanged definition `R=max(D,Hmax,cstar,10^12)` still
satisfies R=D. The new proof uses an estimate on the same catalogue, not a
replacement catalogue that might invalidate the pole certificates.

## 4. Propagate through height, cutoff and polynomial bounds

The manuscript's comparison `Ccm < 2^(50000 D^2) < Q_D^17` continues to
hold. Thus its explicit formulas now yield

\[
T=(96\cdot10^{13})^{13}D^{2210G_0^2D^3},\qquad G_0=116064000000.
\]

The original height and false-multiplication argument applies with this D
and the corresponding Aheight. It bounds every false triple admitted by
the height certificate inside [-T,T]^3. The finite interpolation guard at
this smaller T excludes all of them. True multiplication triples continue
to pass. The finite guards for different cutoffs are not asserted equivalent
on arbitrary rational inputs in isolation; equivalence uses the height
certificate. The interpolation/product equivalence at a *fixed* cutoff
remains valid on all rational inputs.

As before, `log2 T < D^8`. Since `log2 D < 2^834`, this gives

\[
\boxed{T<2^{\,2^{\,2^{837}}}}.
\]

For comparison, applying just F=144! in the old generic Hom-field formula
gives `log2 D < 2^3328`, and hence `T < 2^(2^(2^3331))`. The manuscript
states `T_dated < 2^(2^(2^9013))`. These are certified upper bounds; no
astronomical integer has been expanded.

All fixed constants and occurring division indices are still below T;
the latter are at most 2D+1. In particular
`deg psi_j <= 2(|j|+1)^3 <= 128D^3 < T`. The original constructor norm
estimates and the interpolation norm estimate therefore still use B=T+1.
The same simultaneous bounds are valid with this smaller B:

\[
\deg P\le(T+1)^{2048},\qquad
|[X^\alpha]P|\le2^{(T+1)^{2048}}.
\]

They imply degree below `2^(2^(2^838))` and coefficients below
`2^(2^(2^(2^838)))`. The sharper linear degree traversal also remains
valid. No variables, equations, or new fixed-expression operators are added.

## 5. Further cover structure: a separate possible improvement

The factorial bound ignores the normalizer action entirely. If a finite
group acts over Q transitively on a fibre with m geometric points, its
Galois permutation group centralizes that action. The centralizer has order
at most m: a commuting permutation is determined by its value at one point,
since the group is transitive. Its splitting field then has degree at most
m, rather than m!.

Canonical Shimura models carry their adelic action over the reflex field
([Milne, *Introduction to Shimura Varieties*, section 12](https://www.jmilne.org/math/xnotes/svi.pdf)).
This suggests F=144 may be available here. Applying it requires identifying
the manuscript's precise full-three moduli model, normalizer quotient, and
normalized pullback with that Q-defined action. A transitive action merely
over Qbar would not suffice: Galois could normalize, instead of centralize,
it. We have not completed that identification here and do **not** use this
further substitution in the generated polynomial or its reported bounds.
If it works, the fixed catalogue and formal multiplier need renewed attention:
the present proof that R=D would no longer follow.

## Verification status

`verify-cutoff.js` checks the level-group counts, factorial inequalities,
symplectic group order, and the integer inequalities used above. It also
checks that the optimized fixed-definition audit rejects old or corrupted
prescriptions and that every unchanged constant retains its original
expression. The generated expression and reports have new pinned hashes.
These tests check the numerical and syntactic consequences; the geometric
and Galois arguments are the proofs above, conditional on the manuscript's
stated geometric inputs. They have not received independent human review or
Lean formalization. This supplement was developed with ChatGPT/Codex at the
repository owner's request.
