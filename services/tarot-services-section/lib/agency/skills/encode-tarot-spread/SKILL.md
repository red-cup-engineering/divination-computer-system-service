---
name: encode-tarot-spread
description: Record a tarot draw — positions, cards, orientations — into the corpus's YAML format for later interpretation or cross-reference.
requires-capabilities:
  - write
  - markdown-file-workbench
---

# Encode Tarot Spread

## When to use

You've just done a draw and want a corpus artifact: positions, the card at each position, and orientation. The reading itself is over — this skill is about turning what the cards showed into a record the corpus can refer back to.

## How it works

1. Identify the spread. Each entry under `library/domains/humanities/domains/divination/domains/tarot/domains/spreads/` declares its ordered list of positions. Copy that list.
2. For each position in order, record:
   - The card drawn, by canonical name from `terms/major-arcana.md` or `terms/minor-arcana.md`.
   - Orientation: `upright` or `reversed` (see `terms/orientation.md`).
3. Save as YAML following the shape in `library/domains/humanities/domains/divination/domains/tarot/SPECIFICATIONS.md`. Place under `domains/tarot/domains/examples/` with a date-stamped filename, or under a session folder if one exists.

## Examples

See existing files under `library/domains/humanities/domains/divination/domains/tarot/domains/examples/`.
