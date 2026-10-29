# @emsenn/divining

Divining is **sign-reading as settling**.
It is the technical (Cicero's *artificiosa*, inductive) divination — astrology, cartomancy, numerology, the computus, the lectionary — rebuilt as one morphism over a configuration of the faculties:

```text
relating · communicating · knowing · socializing · playing
```

A divination is never primitive ontology.
It is the **settlement of a panel of sign-witnesses into a charge over the bilattice FOUR**, read two ways.

## The Reading

The package's settled object is a `Reading`.
It is produced by

```text
read(question, cut, panel) : Reading
```

where the `question` is admitted through `@emsenn/communicating` (`divine(...)
`), the `cut` is the divinatory "now", and the `panel` is a list of `SignWitness`es.
The path:

```text
question                      admitted through communicating → Mark / Utterance
panel of SignWitnesses        corroborating | refuting | signing
  ↓  adjudicate
socializing Social Field      each sign = an observer; converge = the knowledge-join
  ↓                           consensus ∨_k, with its opposition-H¹ (the consensus cost)
settled bilattice charge      over relating's FOUR
  ↓  read as the σ-dual pair (the Klein-gauged Priestley duality)
diagnosis   (≤_k present)     cognized as a knowing known-state
prediction  (≤_t not-yet)     reached by a playing ludics cut
  +  the D₄ orbit             the eight dihedral images (gauge ∼, −, σ)
```

### The four corners of a reading

The settled diagnosis is one of FOUR — the divinatory reading is *which corner*:

| Diagnosis            | Charge | Reading                                              |
|----------------------|--------|------------------------------------------------------|
| `absurd`   (⊥ₖ)      | none   | no sign — the open question / the not-yet            |
| `potential` (t)      | for    | an affirmed, corroborated omen                       |
| `active`   (f)       | against| a counter-indication / refuted sign                  |
| `stable`   (⊤ₖ)      | both   | **oracles disagree — contradiction held, not exploded** |

A held contradiction (`stable`) is paraconsistent: cross-checked oracles that disagree are *held* (Evans-Pritchard's *benge*), local to the question, never an explosion.

### The two poles

* **diagnosis** — the knowledge-order (`≤_k`) value, the held present, *cognized* by `@emsenn/knowing` (`reading.cognition`: its FOUR standing and whether it is `contested`, a held contradiction).
* **prediction** — the order-swap σ of the diagnosis, the truth-order (`≤_t`) reach toward the not-yet; the **Priestley dual** of the diagnosis.
  `@emsenn/playing` cuts the diagnosis against its dual (`reading.interaction`: the Girard cut `Design ⊗ Design^⊥`, and whether it `converges` at a Daimon — orthogonality).

Diagnosis and prediction are one object seen through the order-swap `σ`, gauged by the Klein-four `K₄ = ⟨∼, −⟩` — together the dihedral `D₄` symmetry of the bilattice square, carried as the reading's `orbit`.
(`D₄` lives upstream in `@emsenn/relating`.)

## The practices

Every divinatory practice is a **producer of a sign-panel** read through the one core.
None is primitive; each reuses its own domain math to emit `SignWitness`es:

| Subpath                              | Practice            | Produces a panel from…                                  |
|--------------------------------------|---------------------|---------------------------------------------------------|
| `@emsenn/divining/astrology/experimental` | astrology      | ephemeris **theories** (Meeus–Standish vs truncated) as witnesses; `readBody` / `readChart` |
| `@emsenn/divining/divination`        | cartomancy / numerology | a tarot **spread** (upright corroborates, reversed refutes) / a **reduction**; `readSpread` / `readReduction` |
| `@emsenn/divining/calendar`          | the computus        | a date's borne **features** (Easter, feasts, cycle points) — absence is silence, not refutation; `readDate` / `readSpan` |
| `@emsenn/divining/liturgy`           | the lectionary      | the **lections** appointed for a date (RCL + Roman); concurrence corroborates, cross-lectionary divergence refutes; `readLections` |

The root morphism `divine(action, token, ?claim)` admits a question/context through `@emsenn/communicating`; the subpaths expose each practice's `read*` producers.

## Commands

A thin CLI over the astrology and divination readings.
Charts print in glyph notation via `./divination/codecs`; every chart carries the ephemeris' provenance, so a printed line is a witnessed claim, not an assertion.

```sh
divination-chart [ISO-instant] [--json]
divination-events <ISO-start> <ISO-end> [--body sun,moon,...] [--json]
divination-aspects [ISO-instant] [--json]
divination-draw [YYYY-MM-DD] [--salt routine-read] [--count N] [--spread]
divination-reduce [YYYY-MM-DD]
```
