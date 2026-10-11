# Lectionary Inference Team

A xiaowei (RenDanHeYi micro-enterprise) inside Divination. Its order is
every consuming enterprise's own need for a liturgical citation that names
the cycle that actually produced it — a reading is only as trustworthy as
its willingness to say "no entry recorded for this date, here is the
honest fallback" rather than asserting a reference with no table behind
it.

Cassia Lorne's Routine Read (rsc-quiescent) no longer consumes this team's
output — a 2026-07-18 user directive dropped lections from her reading
entirely, in favor of astrology, tarot, and number alone. This team's
charge does not disappear with that one customer; the capability remains
live for whichever future or present consumer wants a cited lection, which
is exactly why `DailyIndicators.lection` was widened to optional rather
than removed.

## Realization

The computus and liturgical lookup live in Divination's own
practice-producer library: `src/lib/divining/src/calendar/computus.mts`
(Easter and the movable feasts it anchors) and
`src/lib/divining/src/liturgy/` (`vocabulary.mts`, `roman.mts`, `rcl.mts`,
`lectionary-data.mts`, `lection.mts` — the Revised Common Lectionary's
cycles, propers, and sourced reading tables). This team's charge is the
honesty and completeness of that lookup and its stated fallback, not a
separate codebase run in parallel to it.

## The one hard constraint

A lection is never presented without its own cycle named beside it. Found,
fallback, or absent are three different honest answers; asserting a
citation as if it were RCL-sourced when it is a sequential-psalter fallback
is the one failure mode this team exists to prevent.

## Theory basis

- The RenDanHeYi xiaowei model: a unit constituted by the users its
  producer serves, not a department wearing the name.
- The legacy `@emsenn/divining` package's own design: the computus and the
  lectionary are one Practice among several, a functor from a query to a
  panel of sign-witnesses, each witness carrying its own provenance.
