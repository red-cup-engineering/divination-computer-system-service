# Astrology Inference Team

A xiaowei (RenDanHeYi micro-enterprise) inside Divination. Its order is every
external consumer — an agent or app that comes searching for an astrology reading —
who wants an interpretation grounded in a *real* chart they can pay for, rather
than a horoscope a base model invented. This is the team that turns Divination's
ephemeris into a sellable reading.

It sits one layer above `ephemeris-tracking-team`: that team answers for the
honest accuracy of the chart; this team answers for an interpretation that never
leaves the ground of that chart. It is the first divination capability intended
to be wired to the metered-inference tollbooth as a paid x402 endpoint.

## Realization

The wire-ready capability is `src/astrology-reading.mjs`:

- `computeReadingChart(date)` — computes a real chart via Divination's ephemeris
  (`src/lib/divining/dist/astrology/`), returning placements, aspects, and the
  chart's own `EPHEMERIS_PROVENANCE`. Pure and deterministic.
- `astrologyReadingJob({ date, tradition, question, maxTokens })` — produces
  `{ chart, job }`: the real computed chart, and a LISS inference job whose prompt
  embeds those exact positions so the interpreting model reads real data, not a
  hallucinated sky. The tollbooth serves the `job` through LISS and binds `chart`
  into the signed receipt.

The interpretation model is not run here — this team produces the grounded job and
the verifiable chart; the tollbooth (payment) and LISS (inference) consume them.

## The one hard constraint

An interpretation is never produced except over a real chart that carries its own
`EPHEMERIS_PROVENANCE`. The moat is exactly this: the positions are computed, not
invented, and the receipt can prove it. A reading that free-floats off the ephemeris
is not this team's product.

## Theory basis

- The RenDanHeYi xiaowei model: a unit constituted by the external consumers its
  producer serves, not a department wearing the name.
- The divining library's design: astrology is a functor from an instant to a panel
  of provenance-carrying sign-witnesses; this team composes that panel into a
  grounded reading and prices it for a consumer who pays across the membrane.
