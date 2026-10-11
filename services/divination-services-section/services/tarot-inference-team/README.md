# Tarot Inference Team

A xiaowei (RenDanHeYi micro-enterprise) inside Divination. Its order is not
a budget line or an assignment: it is every consuming enterprise's own
need for a tarot draw that is genuinely a draw — seeded, reproducible from
that seed, and honest about its own method — rather than a card asserted
into existence with no witness behind it.

## Realization

The draw itself lives in Divination's own practice-producer library:
`src/lib/divining/src/divination/tarot.mts` (`TAROT_DECK`, `drawCards`,
`dailySpread`) and its wire codec at `src/divination/codecs/spread.mts`.
This team's charge is the design and honesty of that producer — the
seeded-draw method (`xmur3+mulberry32 fisher-yates, orientation by next
uniform < 1/2`, currently), the deck's own completeness, and the spread
shapes it can compose into — not a separate codebase run in parallel to
it, per module-developer's rule that a unit's design and its code are one
act.

## The one hard constraint

A draw is never re-rolled to fit an outcome. The seed is derived once, from
the calling context (a date, a salt), and the same seed always reproduces
the same card — that reproducibility is the whole of what makes a draw a
witness rather than a claim.

## Theory basis

- The RenDanHeYi xiaowei model: a unit constituted by the users its
  producer serves (every consuming reading), not a department wearing the
  name.
- The legacy `@emsenn/divining` package's own design: cartomancy is one
  Practice among several, a functor from a query to a panel of
  sign-witnesses — this team owns the cartomancy functor specifically.
