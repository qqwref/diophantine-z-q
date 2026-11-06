# A smaller fixed prime catalogue

The optimized modulus is

\[
\boxed{W=8\cdot3\cdot5\cdot7\cdot13\cdot17=185640.}
\]

The catalogue still consists of the first 22 primes **greater than 324** in
every unit class modulo W. Its exact size is `22*phi(W)=811008`, and its
largest prime is **23150593**, in class 131233. `prime-catalogue.js` verifies
this by a complete sieve through 25 million and counts every class. It records
the SHA-256 of the selected primes in increasing order, each encoded as four
little-endian bytes. Neither a distribution estimate nor a probable-prime
test is needed. Running the checker takes well under a minute on the tested
environment; it is included in the optimized construction suite.

The following replaces the *initial progression* in the manuscript's fixed
twenty-two-prime-pattern proposition. It preserves that proposition's
conclusion and all subsequent sieves. This is a change to the mathematical
construction, not a better estimate for the old catalogue.

## Preserve the arithmetic bad-prime set

Keep `P0=product(p<=324)`, `Ns=P0*Hproduct`, and the definitions of M, cstar,
and ell. Only W is decoupled from P0. The height and normalized-cover arguments
still exclude every prime through 324. In particular, no good-reduction or
ramification assertion at the newly omitted modulus primes is being assumed.

Write B={0,-15,-20,-24,-30,-60,1}, u3=Av-u1-u2, and consider the forms
v and u_j-bv. Fix the real box and signs epsilon_nu as in the manuscript.
Let S0={2,3,5,7,13,17} be the primes dividing the new modulus.

At q in S0 perform exactly the old q^5-avoidance and q^8-lifting construction.
Set `d_nu=product(q in S0) q^e(nu,q)`, with 0<=e<=4. These d_nu still divide
P0^4, so they belong to the original allowed set of small-prime multipliers.
Choose the desired prime residues 1 modulo 8, 3 modulo 7, and 1 at the other
odd q in S0. The new catalogue supplies distinct h_nu adjusting the stripped
unit parts to these residues. As before, 22 primes per class suffice for
all 22 demands. Put k_nu=d_nu*h_nu.

## Handle the remaining small primes after choosing h_nu

Fix a prime q<=324 outside S0. Every k_nu is a unit modulo q, since h_nu>324.
We require all F_nu to be nonzero modulo q. At q congruent to 1 modulo 4
we also require `epsilon_nu F_nu != -k_nu`, equivalently Psi_nu != -1.
The latter condition is unnecessary at q congruent to 3 modulo 4: an odd
common divisor of the two conjugate reduction orders would imply that -1
is a square modulo q, as proved in the original conjugate-orders argument.

For q>=23 choose v avoiding 0 and, when needed, `-epsilon_0*k_0`.
For each j, at most seven values of u_j make some u_j-bv zero. At most
seven further values make some `epsilon_(j,b)(u_j-bv)=-k_(j,b)`.
Thus the allowed set A_j has at least q-14 elements. The Cauchy-Davenport
inequality, applied twice, gives

\[
|A_1+A_2+A_3|\ge\min(q,|A_1|+|A_2|+|A_3|-2)
\ge\min(q,3q-44)=q.
\]

Consequently u1+u2+u3=Av has a solution in these allowed sets, **for every**
A, every chosen collection of k_nu, and all the previously fixed signs.
This quantifier order lets us choose the catalogue primes first.
For the sumset inequality see, for example,
[Tao, *An uncertainty principle for cyclic groups of prime order*](https://arxiv.org/abs/math/0308286).

The only omitted primes below 23 are 11 and 19; both are 3 modulo 4.
Here only zeros must be avoided. Take v=1. The allowable slopes modulo 11
are {4,5,8,10}; their threefold sum is all of F_11, as checked exhaustively.
Modulo 19 there are 12 allowable slopes, so Cauchy-Davenport already gives
the result; the checker also enumerates all sums. These residues solve
u1+u2+u3=A for every A. Lift each chosen vector arbitrarily modulo q^8.

## Finish the existing prime-pattern proof

At each selected h_nu>324 use the old independent-plane construction and
lift modulo h_nu^2. All pairwise minors and the bound 42h<h^2 are unchanged.
Use CRT with the **same shape** of initial modulus

\[
W_0=\prod_{q\le324}q^8\prod_\nu h_\nu^2.
\]

All Psi_nu are integral affine forms and nonzero modulo every prime
dividing W0. Their variable coefficients are divisible by every such prime.
They also differ from -1 at every prime dividing W0 that is 1 modulo 4,
and at all selected h_nu. At 7 they have the required residue 3.
We deliberately no longer claim Psi_nu != -1 at 11 and 19; that stronger
intermediate assertion is not needed.

For primes q<=L not dividing W0 retain the original 44-plane exclusion.
They still all exceed 324, so its positive density bound and dependence
on L are unchanged. Keep Q*=max(324,H). Both upper sieves still use only
primes above this fixed Q*. The conjugate-order proof needs exclusion of
an odd common divisor only at primes q=1 modulo 4; it has exactly that
exclusion for every q<=L. Thus its gcd=4 conclusion and the argument
discarding larger common divisors remain valid. The split-prime and opposite
twist conditions still follow from the unchanged residues modulo 8 and 7.

The construction therefore supplies the same prime pattern using the smaller
fixed catalogue. Pole clearing and the formal multiplier retain their old
formulas, evaluated with this new catalogue. Because the original multiplier
set permits every d dividing P0^4, using only the smaller supported d is
permitted. All variables and polynomial constructors remain the same.

## Scope

The residue computations and the entire finite catalogue are checked exactly.
The application of Cauchy-Davenport and the transfer through the manuscript's
prime-pattern proof are mathematical arguments, not machine formalizations.
This supplement and implementation were developed with ChatGPT/Codex at the
repository owner's request. No optimality of W or independent human review
is claimed.
