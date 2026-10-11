# Divination Services Section

Lenticule-science's sovereign settlement for **sign-reading as settling**.

Sibling to [Obsmetrologia][obsmetrologia] rather than a persona or a
publishing product: Obsmetrologia is the firm's formal mathematics,
Divination is the firm's formal theory of reading, and both are meant to be
served to other micro-enterprises through the Internal Market rather than
run directly against a user.

[obsmetrologia]: ../obsmetrological-services-section/src/services/obsmetrologia

## What's here

- `src/lib/divining/` — the live, source-available practice-producer
  library (astrology, tarot, numerology, the computus, the lectionary,
  geomancy, the I Ching, Ifá, runes, the Numogram, Lakota star knowledge),
  ported from the legacy `@emsenn/divining` package. See
  [`content/text/documents/sign-reading-as-settling.md`](content/text/documents/sign-reading-as-settling.md)
  for the theory it realizes and what was deliberately left unported.
- `content/offices/sign-reader.json` — the office answering for what a
  sign-panel settles to.
- `lib/` — this node's own classes and instruments, per the mesh-scope rule.
- `content/contracts/settle-rmn-daily-reading.rml` — the service law. One
  RMN effect bundle binds the date and tradition; the provider
  returns one fully typed RMN reading or refusal, one FOUR-cover WIT, CBOR
  objects, and WitnessJournal N-Quads. JSON is only the ActivityStreams wire carrier.
- `src/contract-daily-reading.mjs` — the sole executable boundary. There is
  no solicitation phase, packet file, exchange schema, JSONL ledger, or
  compatibility harness.

See [`AGENTS.md`](AGENTS.md) for the settlement membrane, delegation rule,
and obligation loop.

## Founding

Stood up 2026-07-17 as a sovereign state enterprise per user directive, to
revive Cassia Lorne's Hive Routine Reads (rsc-quiescent) with NIM-generated
imagery.
