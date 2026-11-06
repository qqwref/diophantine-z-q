# Z is Diophantine in Q

This repository contains the November 5, 2026 manuscript **Z is Diophantine in Q**, the October 11, 2026 manuscript **A conditional Diophantine definition of Z in Q from four arithmetic inputs**, and comparison notes. A research archive preserves the constructions, computations, proof drafts, reviews, and partial Lean formalization developed for the 11/5 manuscript.

## Start here

| To… | Open… |
| --- | --- |
| Read the 11/5 argument | [11/5 manuscript PDF](diophantine_zq.pdf) |
| Inspect or edit the 11/5 manuscript | [11/5 TeX source](diophantine_zq.tex) |
| Read the 10/11 manuscript and compare the constructions | [October 11 Manuscript](October%2011%20Manuscript/README.md) |
| Browse the polynomial and run its checks | [Curated construction](construction/README.md) |
| Build the 11/5 manuscript or accepted Lean modules | [Build instructions](docs/building.md) |
| Inspect the formalization | [Accepted Lean helper snapshot](lean/README.md) |
| Find the construction, supporting calculations, or earlier approaches | [Research guide](docs/research-guide.md) |
| Audit exact theorem applications, conventions and repairs | [Theorem application inventory](docs/theorem-application-audit/README.md) |
| Download the saved research history | [Research handoff zip, 340 MB](https://github.com/elliotglazer/diophantine-z-q/releases/download/research-handoff-2026-11-04-r2/z-in-q-research-handoff-2026-11-04-r2.zip) |
| Check a download | [SHA-256 checksums](SHA256SUMS) and [verification instructions](docs/research-guide.md#verify-and-restore-the-archive) |
| Report a mathematical or implementation issue | [Contribution guide](CONTRIBUTING.md) |
| Cite the 11/5 manuscript or research archive | [BibTeX entries](CITATION.bib) |

The current 11/5 TeX source and PDF, together with the dated research handoff snapshot, are also available from the [current research release](https://github.com/elliotglazer/diophantine-z-q/releases/tag/research-handoff-2026-11-04-r2).

## The 11/5 manuscript's result

To say that the integers are **Diophantine in the rationals** is to say that being an integer can be expressed by one polynomial equation with rational auxiliary variables. The 11/5 manuscript presents a construction of a fixed polynomial with integer coefficients such that

$$
q\in\mathbb Z
\quad\Longleftrightarrow\quad
\exists\,\mathbf w\in\mathbb Q^{292\,890\,231\,904},\quad P(q,\mathbf w)=0,
\qquad q\in\mathbb Q.
$$

The input is the ordinary rational number $q$. The witnesses are rational numbers as well. The same polynomial must work for every input.

The stated bounds for this polynomial are:

| Quantity | Bound |
| --- | --- |
| Total ambient variables, including the input | 292,890,231,905 |
| Total degree | Less than $2\uparrow\uparrow 7$ |
| Absolute value of each coefficient | Less than $2\uparrow\uparrow 8$ |

Here $2\uparrow\uparrow n$ is a right-associated tower of $n$ twos: $2\uparrow\uparrow 1=2$ and $2\uparrow\uparrow(n+1)=2^{2\uparrow\uparrow n}$. The variable count is an ambient bound; it does not assert that every variable occurs essentially. The construction is specified through finite formulas and substitutions, rather than an expanded list of monomials.

The 11/5 manuscript derives three consequences:

- A refutation of Mazur's finite-connected-components conjecture for the closure of rational points in the real locus.
- A universal rational Diophantine polynomial with ordinary integer program and input parameters.
- Many-one equivalence of $\operatorname{HTP}(\mathbb Q)$ with the halting set $0'$.

The bounds above concern the integer-defining polynomial $P$. They do not automatically apply to the universal polynomial or its specializations.

## Relation to earlier work

The 11/5 construction builds on OpenAI's preprint [*Hilbert's tenth problem over the rational numbers*](https://github.com/openai/math/blob/main/preprints/Hilberts-tenth-problem-over-the-rational-numbers-October-6-2026/main.pdf), dated October 6, 2026. The 11/5 manuscript concerns a Diophantine definition of the ordinary embedded integers and its stated quantitative bounds. Undecidability of the existential theory of the rationals is not presented here as a new corollary of this project.

The 11/5 manuscript's bibliography and source-application appendices identify its other mathematical inputs. The [research guide](docs/research-guide.md#map-of-the-argument) connects the 11/5 arguments to their supporting files.

## Comparison with the 10/11 manuscript

The [10/11 manuscript](October%2011%20Manuscript/ZIsDiophantineInQBySohailsGPT-6.pdf) and the 11/5 manuscript use the same elliptic curve and share a strategy: build arithmetic on integer labels, control the height of a candidate rational scalar, and force it to equal its labelled integer by sufficiently accurate approximation. The 10/11 manuscript uses congruence at the fixed prime $3$; the 11/5 manuscript uses real approximation with an auxiliary shift.

The 10/11 argument is explicitly conditional on four OpenAI arithmetic inputs. The 11/5 manuscript presents an unconditional argument and gives simultaneous numerical bounds for its specified polynomial. The 10/11 manuscript does not give a numerical variable count or coefficient bound. Its degree-four conversion is also available for the 11/5 polynomial, with additional variables, so degree alone does not establish a smaller construction. See the [full comparison notes](October%2011%20Manuscript/README.md) for the interfaces, qualifications, and source references.

## Verification status

The [November 5 theorem application inventory](docs/theorem-application-audit/README.md) records 82 scoped review decisions, 147 citations and 443 anchored contexts, with exact source versions, maps, hypotheses and convention changes. The identified source-application obligations have been reviewed and their repairs integrated, including the de Rham comparison and local cochain arguments. [Explicit internal premises remain](docs/theorem-application-audit/DEPENDENCIES.md). These AI reviews do not independently certify every internal lemma or the main theorem.

The 11/5 manuscript presents an unconditional proof. Revision 2 of the 11/5 manuscript includes the later restricted-converse and theta justifications and replaces the von Känel–Kret height dependency with a direct modularity argument and a CM argument. [Four independent AI reviews](docs/reviews/height-replacement/REPORT.md) found no unresolved gap in the replacement within their stated scopes. The revised 11/5 text includes their requested clarifications. These reviews are distinct from independent human peer review and machine verification. See the [revision notes](docs/revision-2.md).

**The Lean formalization is incomplete.** At the November 4 handoff, the main bounded-polynomial declaration still contains `sorry`. The last accepted production snapshot is integration 31, containing 48 modules and 463 explicit public declarations. These counts include definitions and helper results; they are not a count of completed main-proof obligations. Later accepted work remains outside that integration.

The archive preserves superseded and unsuccessful approaches as well as later work. Start with its `CURRENT_STATE.json`, `START_HERE.md`, and `current/` directory before relying on a historical status report. See [the formalization notes](docs/research-guide.md#lean-formalization) for the remaining groups of obligations.

## Research archive

The handoff indexes 57,450 original file locations. Repeated byte-identical files share stored content. It includes a searchable offline `INDEX.html`, a manifest with hashes, a research timeline, and a utility for restoring the original directory layout. Conversational transcripts and credentials are excluded.

The root-level TeX source is the reviewed revision of the 11/5 manuscript; the matching 148-page PDF was rebuilt from it. The November 4 handoff preserves the first release's research history and adds subsequent sources, manuscript versions, feedback and reviews. The repository offers one current release; earlier research versions remain inside the handoff archive. The November 5 audit and its new sources are documented separately in the repository and its source-restoration manifest; the November 4 handoff is not an updated copy of that audit.

## Reproducible checks

An [optimized construction](construction/optimized/README.md) preserves the dated
artifacts and provides a separately reproducible equivalent specification with
211,983,774,909 total variables (27.62% fewer). It simplifies constant arithmetic,
uses three squares for nonnegativity, and replaces the cubic-size finite exclusion
product with an interpolation guard using the same one witness. The
[smaller-cutoff supplement](construction/optimized/cutoff.md) reduces the
field-degree bound to D=144, uses its full three-torsion marking and sharper
prime-support estimates, and reduces the cutoff bound from
`2^(2^(2^9013))` to `2^(2^44)`, without adding variables. A
[smaller catalogue](construction/optimized/prime-catalogue.md) uses W=185640
and has an exactly computed maximum H=23150593. The curve structure and an
elementary primorial bound give R=H and Q=4^(866H). The accompanying
notes prove the interface equivalences and give degree and coefficient bounds;
these changes inherit the original construction's arithmetic inputs. Run
`python scripts/check_optimized_construction.py --output build/optimized` to
generate its expression and verify the pinned reports. CI runs both constructions.

The [curated construction](construction/README.md) provides the finite expression, its pinned input, and executable checks without requiring the historical archive. The [Lean directory](lean/README.md) contains the byte-identical accepted helper snapshot, its dependency pins, and a separate unproved target.

The [CI workflow](.github/workflows/research-checks.yml) checks construction regeneration, finite arithmetic cases and inventory consistency, compiles the 11/5 manuscript, and builds the accepted Lean modules with an axiom audit. See [build instructions](docs/building.md) for local commands and the limits of each check. A green CI run concerns those checks, not completion of the main proof.

## AI usage and attribution

The October 11 Manuscript was produced by Sohail Farhangi with ChatGPT 6. The November 5 Manuscript was produced by Elliot Glazer with Astra 6, Sol 6.1, and Opus 5.5, with auditing from Fable 5.1.

[CITATION.bib](CITATION.bib) supplies citation entries for the 11/5 manuscript and research archive with the author field intentionally omitted. Identify a research artifact by the release tag and file hash as well. [Archival release notes](docs/archiving.md) explain the DOI status.

Licenses for original project material are awaiting the maintainer's selection. [Third-party notices](THIRD_PARTY_NOTICES.md) identify upstream software and mathematical sources; the project's license will not relicense those materials. The historical archive needs a per-source redistribution review before public release.
