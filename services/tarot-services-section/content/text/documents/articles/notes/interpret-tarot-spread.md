---
name: interpret-tarot-spread
id: interpret-tarot-spread
description: Interpret a tarot spread using card meanings and position roles. Use when
  turning a spread draw into a narrative reading.
type: learn
authors:
- gpt-5.2-codex
date-created: 2025-12-31
keywords:
  - Tarot
runtime:
  invocation: inference
  tool: human
region:
  reads: ["content/spirituality/divination/tarot/"]
  writes: ["content/spirituality/divination/tarot/"]
dependencies:
- /spirituality/divination/tarot/SPECIFICATIONS.md
- /spirituality/divination/tarot/cards/major-arcana.md
- /spirituality/divination/tarot/cards/minor-arcana.md
part-of: spirituality/divination/tarot
---

# Interpret Tarot Spread

- Run `scripts/interpret-tarot-spread.py` on a YAML spread draw.
- Review the position roles and card themes in context.
- Write a short narrative linking position, orientation, and card meaning.
