# A reserve catalogue with modulus 56

The current catalogue is the first **45 primes greater than 324** in each
unit class modulo **W=56=8*7**. It contains 1080 primes and has exact maximum
**H=10321**. This replaces the preceding 22-per-class catalogue modulo
185640 (811008 primes, H=23150593).

`prime-catalogue.js` verifies every prime and class with an Eratosthenes sieve.
It also checks the reserve property needed below: for every unit class r
modulo 56 and every three nonzero residues a mod 5, b mod 13, c mod 17,
there are **at least 22** catalogue primes h in that class with

\[
h\not\equiv a\pmod5,\qquad h\not\equiv b\pmod{13},\qquad
h\not\equiv c\pmod{17}.
\]

There are exactly 24*4*12*16=18432 cases. The minimum is 22; it occurs,
for example, at r=5 and (a,b,c)=(1,2,14). Thus the proof uses a small
exhaustively verified finite combinatorial property, not a uniform theorem
on primes in arbitrary progressions. The ascending uint32-LE catalogue hash
is recorded in the pinned verification report. No claim that 45 or W=56 is
optimal is made.

## Initial progression: order of the choices matters

Keep P0=product(p<=324), Ns=P0*Hproduct and the formulas for M, cstar and ell.
Every prime through 324 is still excluded in the height and ramification
arguments. Only the catalogue changes.

Write B={0,-15,-20,-24,-30,-60,1} and u1+u2+u3=Av. The 22 forms are v and
u_j-bv. Fix the real box and its signs epsilon_nu as in the manuscript.

1. At q=2,3,7 use the original avoidance modulo q^5 and lifting modulo q^8.
   Each form has a fixed valuation e(nu,q) between zero and four. Put
   d_nu=product(q=2,3,7) q^e(nu,q); this still divides P0^4.
   Prescribe the eventual prime values to be 1 mod 8 and 3 mod 7.
   These specify one unit class modulo 56 for each h_nu through
   h_nu=(epsilon_nu F_nu/d_nu)/c_q modulo 8 or 7.
   No prescribed prime residue modulo 3 is needed: stripping its valuation
   already makes Psi_nu=epsilon_nu F_nu/(d_nu h_nu) a unit there, and an odd
   common divisor of the conjugate orders must be 1 modulo 4.

2. At q=5,11,13,17,19 choose v=1 and slopes u_j outside B modulo q with
   u1+u2+u3=A. These exist for every A: the checker enumerates the threefold
   sum of the complement of B and obtains all of F_q for each of these five
   primes. Thus all 22 forms are nonzero modulo q. Lift modulo q^8.

3. Now choose h_nu in its specified class modulo 56. At q=5,13,17 the
   condition Psi_nu != -1 is equivalent to avoiding the single nonzero
   residue h_nu=-epsilon_nu F_nu/d_nu modulo q. The reserve property leaves
   at least 22 choices for each demand. Greedy selection makes all 22 h_nu
   distinct: at each step at most 21 previously selected primes are forbidden.
   This works for arbitrary A, signs, d_nu and the chosen small-prime vectors.
   Put k_nu=d_nu h_nu. At 11 and 19 no -1 exclusion is needed, since -1 is
   not a square there and these primes cannot divide the odd part of the
   conjugate-order gcd.

4. At every remaining prime q<=324, hence q>=23, choose the vector after
   the h_nu. Avoid v=0 and, if needed, epsilon_0 v=-k_0. Each u_j then has
   at most 14 forbidden residues: seven zeros and seven values for which
   epsilon_(j,b)(u_j-bv)=-k_(j,b). The Cauchy-Davenport bound gives
   |A1+A2+A3|>=min(q,3(q-14)-2)=q. Therefore the required sum Av is attained
   for every A. Lift this vector modulo q^8.

The sumset theorem is standard; see
[Tao, *An uncertainty principle for cyclic groups of prime order*](https://arxiv.org/abs/math/0308286).
All small residue sets and the entire reserve property are checked exactly.

## Finish the existing prime-pattern proof

At each chosen h_nu>324 impose F_nu=0, avoid the other zero and -k planes,
and lift modulo h_nu^2 exactly as in the manuscript. Pairwise independence
and the estimate 42h<h^2 apply unchanged. CRT now uses

\[
W_0=\prod_{q\le324}q^8\prod_\nu h_\nu^2.
\]

All Psi_nu are integral affine forms, nonzero modulo every prime dividing
W0, with variable coefficients divisible by those primes. They avoid -1
at every such prime congruent to 1 modulo 4, and at the selected h_nu.
The residues modulo 8 and 7 still force split primes and opposite twists.

Keep Q*=max(324,H). At q<=L not dividing W0 retain the original 44-plane
exclusion; these primes still exceed 324. The lower prime count, its
log(L)^(-44) dependence, and both upper sieves are unchanged. The
conjugate-order argument excludes every possible odd common divisor q<=L:
only q=1 modulo 4 could occur. Its argument discarding larger common
factors consequently applies as before.

Thus the same prime-pattern conclusion holds with the new fixed catalogue.
The allowed multiplier set still includes every d dividing P0^4, so using
only d supported on 2,3,7 is permitted. Pole clearing and formal-depth
arguments keep their original formulas with the new catalogue product.
No variables or polynomial-constructor operators are added.

This proof and implementation were developed with ChatGPT/Codex at the
repository owner's request. Finite certificates do not machine-formalize
the transfer through the original prime-pattern theorem; the original
arithmetic inputs remain in force.
