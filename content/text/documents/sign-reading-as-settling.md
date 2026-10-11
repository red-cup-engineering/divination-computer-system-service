# Sign-reading as settling

What this settlement inherited, what it ported live, and what it has
deliberately left as preserved design intent rather than rebuilt.

## The theory, as the legacy `@emsenn/divining` package stated it

> Divining is sign-reading as settling. A divination is never primitive
> ontology. It is the settlement of a panel of sign-witnesses into a charge
> over the bilattice FOUR, read two ways.

The path the legacy package built:

```text
question                      admitted through communicating -> Mark / Utterance
panel of SignWitnesses        corroborating | refuting | signing
  |  adjudicate
socializing Social Field      each sign = an observer; converge = the knowledge-join
  |                           consensus, with its opposition-H1 (the consensus cost)
settled bilattice charge      over relating's FOUR
  |  read as the sigma-dual pair (the Klein-gauged Priestley duality)
diagnosis   (<=_k present)    cognized as a knowing known-state
prediction  (<=_t not-yet)    reached by a playing ludics cut
  +  the D4 orbit             the eight dihedral images (gauge ~, -, sigma)
```

The four corners a reading could settle to:

| Diagnosis            | Charge | Reading                                              |
|-----------------------|--------|-------------------------------------------------------|
| `absurd`   (bottom_k) | none   | no sign — the open question / the not-yet             |
| `potential` (t)       | for    | an affirmed, corroborated omen                         |
| `active`   (f)        | against| a counter-indication / refuted sign                    |
| `stable`   (top_k)    | both   | oracles disagree — contradiction held, not exploded    |

This is the same shape as this firm's own Ȟ¹ gluing-obstruction language
(`gluing-the-sections`, `settling-the-evidence`): a `panelConsensus()` over a
panel of sign-witnesses, reporting whether the panel glues into one common
section and whether reaching that consensus was coordination-free. It is why
Divination sits under lenticule-science rather than being invented fresh: the
formal core already spoke this firm's native mathematics, just never
cross-referenced Obsmetrologia by name.

## What is ported here, live

`src/lib/divining/` carries the **practice-producer layer** — the domain
mathematics that builds a panel of signs from a
query: astrology (ephemeris, chart, aspects, lunation), cartomancy (the tarot
deck and spreads), numerology (date reduction), the computus and liturgical
calendars (RCL and Roman lectionary lookup), geomancy (the sixteen-figure
shield), the I Ching (six-line hexagram casting), the public Ifá Opele
casting structure, the Elder Futhark runes, the CCRU Numogram, and Lakota
seasonal star knowledge. It ships source and is tested as domain mathematics;
the package's declared shared dependencies provide astronomy computation and
the current FOUR-charge provider.

It also carries a live clean **Reading settlement**. `SignWitness` records a
practice's source, label, and FOUR charge; `settleReading()` joins a nonempty
question and cut's panel with Articulating's `joinKnowledge`, returning an
immutable `Reading` whose value is the resulting FOUR charge name. Every live
practice reader uses that common operation. The package tests exercise all of
the restored readers and their practice-specific witness laws.

## What remains deliberately unported

The legacy **extended settlement surface** — its `panelConsensus` API, the
sigma-dual diagnosis/prediction, and the D4 gauge orbit — is not reproduced by
the current `Reading` operation. The legacy implementation depended on five
upstream packages (`@emsenn/relating`, `knowing`, `playing`, `socializing`,
`communicating`) that sit in the dead `2026-06-27-agential-relationality`
archive under red-cup-engineering.

The 2026-07-13 `normalize-infography` rule, raised exactly against this
package going dark, is explicit: broken firm code gets rewritten *off*
infography, not re-wired into the dead archive it depended on. Resurrecting
an extended settlement surface lawfully therefore means designing and writing
a clean replacement for the needed capability — not importing the archive
wholesale. The live `Reading` settlement is the present common result for a
panel of signs; a future extension must add its own declared semantics and
acceptance evidence rather than claiming the legacy API has returned.

## Provenance

- Original persona and theory stub: lenticule-science's own legacy library at
  `content/assets/legacy/library/philosophy/relationality/psychology/agency/divination/`,
  including the archived Cassia Lorne origin record dated 2025-03-28.
- Deterministic cartomancy/numerology producers: `filum.561.group`
  (`cartomantia.ts`, `arithmomantia.ts`), preserved under AGRODAO's legacy assets.
- The full `@emsenn/divining` package (astrology through starknowledge, plus
  the settling core): `red-cup-engineering/src/content/assets/legacy/2026-07-02-divining/`.
- The interim fix that first named this exact breakage: the 2026-07-13
  `mine the Diviner` commit and its `produce-a-routine-read` skill, at
  rsc-quiescent's `lib/characters/cassia-lorne/`.
