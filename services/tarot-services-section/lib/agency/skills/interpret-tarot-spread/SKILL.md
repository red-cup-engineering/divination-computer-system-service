---
name: interpret-tarot-spread
description: Interpret an encoded tarot spread — turn position roles, drawn cards, and orientations into a narrative reading.
requires-capabilities:
  - read
  - write
  - utter
  - articulate
---

# Interpret Tarot Spread

## When to use

A spread has already been encoded (see `encode-tarot-spread`). The task now is to read it: bring the position roles, the drawn cards, and their orientations into a narrative that respects the spread's structure.

## How it works

1. Read the encoded YAML. Confirm the spread name matches a definition under `library/domains/humanities/domains/divination/domains/tarot/domains/spreads/`.
2. For each position:
   - Look up the position's role in the spread definition (what *this slot* asks the cards to speak to).
   - Look up the card's meaning in `terms/major-arcana.md` or `terms/minor-arcana.md`, modulated by orientation per `terms/orientation.md`.
   - Hold both together — the meaning is position-role meeting card-in-orientation, not the card alone.
3. Write a short narrative across positions: how the cards relate within the spread's structure, not just card-by-card. Save alongside the encoded spread or under a session folder.

## Examples

See narrative readings co-located with encoded spreads under `library/domains/humanities/domains/divination/domains/tarot/domains/examples/`.
