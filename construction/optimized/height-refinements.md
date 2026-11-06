# Local conductors, CM fibres, and the current cutoff

This supplement supersedes the numerical bounds in cutoff.md. It retains
its field/Hom arguments and CM reduction-order prime-support proof, and
uses the reserve catalogue proved in prime-catalogue.md. The current values
are W=56, 45 primes per class, 1080 catalogue primes and H=10321. P0 still
contains all primes through 324. There are no added polynomial variables.

The result is

\[
\boxed{T=(1344\cdot10^{19})^{13}\,2^{6444048}\,3^{1716}
       <2^{6450000}.}
\]

The dependence is still exponential in H. The new catalogue, local conductor
bounds, CM treatment and height transfer all improve the total construction;
none is a degree-versus-variable conversion. Section 6 explicitly separates
the remaining enormous source scalars from T.

## 1. Strengthen the field-degree statement to divisibility

Section 1 of cutoff.md identifies the level-three normalizer action over Q.
Its finite group has order dividing 4*36=144: the normalizer quotient has
order dividing four (its two ramified-prime valuation parities give the
Atkin-Lehner quotient), and the level-unit quotient has order 72/2=36. The
geometric fibre is a transitive set for that group, so its size m divides
144. Its centralizer acts freely: an element fixing one point fixes every
point by transitivity. Thus the centralizer order divides m, and the Galois
group of the fibre splitting field is a subgroup of that centralizer.
Consequently the previous degree bound sharpens to

\[
[K:\mathbb Q]\mid144=2^4 3^2.
\]

All Hom groups are still K-defined by full rational three-torsion, so L=K.
The normal torsion field K(A[5]) has relative Galois group a subgroup of
GL2(F5), hence its degree divides `144*480=69120=2^9*3^3*5`.
The normality argument is the one in cutoff.md: every conjugate A_i is
K-isomorphic to A, and the isomorphism identifies their torsion fields.

## 2. Charge wild ramification only at two and three

For a finite Galois extension of Q_p, let e be its ramification index,
delta its different exponent and b its last positive upper break. The
same different argument used in the manuscript gives

\[
\delta\le e-1+e v_p(e),\qquad
\frac\delta e=1-\frac1e+
\int_0^\infty(1-|G^u|^{-1})\,du.
\]

For 0<u<b the nontrivial group G^u is a p-group, so the integrand is at
least (p-1)/p. Subtracting the tame term, rather than discarding it, gives

\[
\boxed{b\le\frac p{p-1}v_p(e).}
\]

The different inequality follows from the derivative of an Eisenstein
polynomial; its terms have distinct valuations modulo e. It is also given
in [Stevenhagen, *Local Fields*, section 4](https://websites.math.leidenuniv.nl/algebra/localfields.pdf).
The integral formula is already proved in the manuscript from the lower
ramification groups and the Herbrand change of variables.

At p>=5, K/Q is tame by section 1. A has semistable reduction over K because
its full three-torsion is rational. Thus its wild inertia acts trivially on
V_l(A) for l!=p. Absolute wild inertia is contained in G_K, where the
isogeny cocycle is trivial and the character beta is tame at odd primes.
The descended two-dimensional representation is therefore tame, even at
primes belonging to the fixed bad-prime set. Its conductor exponent is <=2.
Use the compatible representation at three to compute the conductor at
five, as justified in the manuscript.

At p=3 use K(A[5]), whose ramification index has v_3(e)<=3. Its last
upper break is at most 9/2. Raynaud's criterion makes A semistable there.
Beta restricted to G_K is tame, and K is contained in that torsion field,
so the descended representation is trivial on upper groups above 9/2.
Its conductor exponent is at most `2+2*(9/2)=11`.

At p=2, the last upper break b of K_v/Q_2 is at most 2*v_2(e)<=8.
A is already semistable over K_v. The manuscript's unit argument shows
that beta on G_(K_v) has relative upper break <=3e. After the final break
of K_v/Q_2 the inverse Herbrand function has slope e, so
`psi(b+3)=psi(b)+3e>=3e`. Hence beta is trivial on absolute upper groups
above b+3<=11. The cocycle and the wild Tate action are trivial there too.
The conductor exponent is at most 24.

The semistability input is Raynaud's criterion, stated as Theorem 3.5 in
[Silverberg–Zarhin (1995)](https://www.numdam.org/article/AIF_1995__45_2_403_0.pdf).
It applies to full n-torsion with n>=3 prime to the residue characteristic;
the choices n=3 away from three and n=5 at three satisfy this hypothesis.

Thus the conductor exponents are bounded by

| Prime | Bound |
| --- | ---: |
| 2 | 24 |
| 3 | 11 |
| p>=5 | 2 |

E0=24 remains a valid uniform bound, but we do not apply it to every prime.
All primes in the fixed bad set are at most H by cutoff.md, section 4.
The elementary primorial bound there gives, for M=M_S(u),

\[
N\le2^{24}3^{11}\Bigl(\prod_{5\le p\le H}p\Bigr)^2 M^2
 \le Q M^2,\qquad Q=2^{24}3^{11}4^{2H}.
\]

The character construction still satisfies `[L':Q]<=4D*4^H*M<=Q*M`,
since 4D=576<2^24. R=max(D,H)=H and Q>2^20. No artificial lower floor
on R is needed.

## 3. Replace the exceptional CM discriminant estimate

The manuscript produces a CM elliptic curve E/K and a K-isogeny E^2->A.
Every geometric endomorphism of E is K-defined: conjugating a block
endomorphism of E^2 by the K-isogeny embeds it in End^0(A), all of which
is K-defined. Restriction back to E then proves the assertion.

The action on the one-dimensional K-vector space Lie(E) embeds the CM
field k into K (the differential is injective in characteristic zero).
Since j(E) is in K too, the ring class field k(j(E)) is contained in K.
For its endomorphism order of discriminant Delta, CM theory gives

\[
2h(\Delta)=[k(j(E)):\mathbb Q]\le144,
\quad\text{so}\quad h(\Delta)\le72.
\]

For this ring-class-field degree statement see
[Sutherland, Lecture 22, sections 22.1–22.2](https://math.mit.edu/classes/18.783/2017/LectureNotes22.pdf).
This extra factor of two puts the problem inside Watkins's unconditional
classification for class numbers up to 100. His table bounds the absolute
fundamental discriminant by 2383747, hence certainly by 3000000. This is
an application of his published theorem, not a new computation proving the
classification and not an assumption of GRH.
Source: [Watkins, *Class numbers of imaginary quadratic fields*, final table](https://magma.maths.usyd.edu.au/~watkins/papers/smallcn.pdf),
published in Math. Comp. 73 (2004), 907–938.

We must also handle nonmaximal orders. Write Delta=f^2 d_k. The order class
number formula, with unit index at most three, gives

\[
h(\Delta)=\frac{h(d_k)f}{[O_k^*:O_f^*]}
\prod_{p\mid f}\left(1-\frac{(d_k/p)}p\right)
\ge\frac{\varphi(f)}3.
\]

Also h(d_k) divides h(Delta), so the same fundamental-field classification
applies. For the formula see
[Kezuka, Theorem 2.16](https://www.ma.imperial.ac.uk/~buzzard/maths/research/notes/Yukako_Kezuka_MSc_Project.pdf).
Thus phi(f)<=216. The elementary inequality phi(f)^2>=f/2 follows by
multiplying `p^(a-2)*(p-1)^2`: each odd-prime factor is >=1, and the
two-factor is >=1/2. Therefore f<=2*216^2=93312 and

\[
\sqrt{|\Delta|}<93312\cdot2000=186624000.
\]

The manuscript's archimedean bound now gives
`h_F(E)<=pi*sqrt(|Delta|)/12+1<100000000=Bcm`.
Using exactly its isogeny estimate with this Bcm, log(28)<4,
log(d)<=144 and log(2Bcm)<20 yields

\[
h_F(A)\le200000000+4096(1024+144+40)<210000000=Ccm.
\]

This replaces the exponential-in-D^2 CM constant by a fixed small integer.

## 4. Keep the actual genus bound in the non-CM height transfer

The manuscript has g<=N^2, h_F(J)<=13000000*N^12 and d'<=QM. Retain
`g<=Q^2 M^4` instead of enlarging it to Q^3 M^4. Its isogeny theorem gives

\[
\log\deg\varphi\le1024g^3
\left(64g^2\log(14g)+\log d'
+2\log\max(h_F(J),\log d',1)\right).
\]

For Q>=2^20 and M>=1, use log(Q)<=Q and log(M)<=M^4/4 to bound the
three logarithms by `6QM^4`, `2QM^4` and `35QM^4`, respectively.
For the third bound use log(13000000)<17; its upper argument
13000000*Q^12*M^24 also dominates log(d') and 1. Substitution gives

\[
\log\deg\varphi\le393216Q^{11}M^{24}+73728Q^7M^{16}
 \le466944Q^{11}M^{24}\le Q^{12}M^{24}.
\]

Height variation and h_F(Z)>=-2g then yield
`h_F(A)<14000000*Q^12*M^24`. Combining both cases and the same theta-height
comparison gives the valid prescription

\[
A_{ht}=2\cdot10^{13}\max(1,Ccm,14000000Q^{12}).
\]

Thus the Q exponent drops from 17 to 12 without changing the M exponent
24 or the local logarithm precision. The non-CM term dominates Ccm for
the prescribed H=10321. The original finite-box deduction applies with
exactly its original formula `T=(48*Aheight)^13`.

## 5. The explicit cutoff and the remaining exponential dependence

Here Q=2^41308*3^11. Since 48*(2*10^13)*14000000=1344*10^19,

\[
T=(1344\cdot10^{19})^{13}2^{6444048}3^{1716}.
\]

Use `1344*10^19<2^74` and `3<4` to get
`log2(T)<13*74+6444048+3432=6448442<6450000`.
Unlike the previous trillion-digit cutoff, this integer has only about
1940959 decimal digits. The checker evaluates it exactly in binary
and compare it to the expression obtained from the fixed-constant rules.

The proof still gives log(T) proportional to H, not T polynomial in H.
The conductor bound contains a product of many fixed bad primes, and the
available modular height estimate is polynomial in that conductor. To get
T genuinely close to H would require a substantially different height bound
or a way to avoid that large product, beyond the refinements proved here.

Increasing the local logarithm precision alone cannot remove this issue:
for precision k>24 the same height mechanism leads to a power of Aheight
whose exponent approaches 1/2 as k grows. Since Aheight is exponential in H,
that would still be exponential in H, while making the local certificate
more complicated. We have not changed that certificate in this revision.

## 6. Overall size: T no longer bounds every source scalar

The old simplification B=T+1 is no longer justified. The pinned precision
source has a fixed scalar with 3181317 decimal digits, larger than the new T.
We retain that source and explicitly introduce an **analysis bound**
`U=2^32000000`; U is not a new coefficient or polynomial constructor.

There are 66 primes in P0 and 1080 catalogue primes. Since H<2^14,
`log2(Ns)<14*(66+1080)=16044`. The unchanged `M<=Ns^10` implies
`log2(cstar)<160442`. For the index shapes cstar,cstar+1,cstar-1,2*cstar,
`deg(psi_j)<=128*cstar^3<2^481333<U`.
Also
`log2(ell)<4+14*(2916*66+732*1080)=13762228<32000000`.

The checkers verify that every extra fixed literal and explicit scalar node
has fewer than 3190000 decimal digits. Since 10^3<2^10, such an n satisfies
`log2(128*n^3)<30*ceil(3190000/3)+7=31900027<32000000`.
The index-shape check and the original division-polynomial estimate therefore
bound every such constructor's degree by U as well. Every fixed constant,
the explicit scalar nodes, and T+1 are also below U, with ample slack for
the additions of one and doubling in the index formulas.

`degrees.py` now states its optimized degree majorant in U, while the dated
column still uses T_dated. It uses T<=U in the interpolation-guard bound and
degree<=U for the scalar constructors. The resulting upper bounds are

\[
\deg P\le32768U+8754752<2^{32000016},\qquad
|[X^\alpha]P|\le2^{U^{2048}}=2^{2^{65536000000}}.
\]

The latter uses the unchanged syntax-height bound 256, now with B<=U.
The guard itself still has degree <=12T+3 and log coefficient norm
<=2^39(T+1)^5. Both fit the same constructor estimates in U.
These bounds improve the preceding overall bounds, but large scalar-index
constructors now dominate the reported degree bound. Further lowering T
alone would not improve that part of the construction.

## Verification and scope

The optimized suite checks the complete reserve catalogue, all 18432 reserve
cases, every small residue sum, the conductor arithmetic, CM inequalities,
isogeny constants, exact binary cutoff, scalar bounds and corrupted constant
prescriptions. It regenerates and pins the polynomial specification and
independent degree/size reports. All original source hashes are preserved.

Watkins's classification, the geometric action, CM theory, local ramification,
the original global prime-pattern theorem and height theorems are mathematical
inputs or arguments, not certified by these finite tests. This work was
developed with ChatGPT/Codex at the repository owner's request; no independent
human review or completed Lean proof is claimed.
