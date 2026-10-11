---
name: encode-tarot-spread
id: encode-tarot-spread
description: Encode a tarot spread draw using the YAML specification. Use when recording
  a reading for later interpretation.
type: operational
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
- /spirituality/divination/tarot/spreads/three-card.md
- /spirituality/divination/tarot/spreads/celtic-cross.md
part-of: spirituality/divination/tarot
---

# Encode Tarot Spread

- Choose the spread and list its positions.
- Record each drawn card with its position and orientation.
- Save the YAML file under `/spirituality/divination/tarot/examples/` or a session folder.
