---
title: "game state"
aliases:
  - "game state"
  - "game-state"
date-created: 2026-03-06
type: term
tags: []
defines:
  - "game state"
---

The game state is the complete set of information that describes the current situation of a game at any moment: whose [turn](./turn.md) it is, what resources each [player](./player.md) holds, what has happened so far, and what actions are available.
If you could freeze a game and hand it to a stranger, the game state is everything they would need to continue playing correctly.

Some game state is public (the board position in chess, the score in tennis).
Some is private (the cards in your [hand](../topics/card-games/terms/hand.md), your planned strategy).
Some is hidden from all players (the order of an undrawn [deck](../topics/card-games/terms/deck.md), the contents of a sealed envelope in a mystery game).
The distribution of information across these categories is a key design choice in any game — it shapes what kinds of reasoning players can do and what kinds of uncertainty they face.

Games where all state is public (chess, go) are called *perfect information* games.
Games with private or hidden state (poker, most card games) are *imperfect information* games.
This distinction drives fundamental differences in strategy: perfect information games reward calculation and planning; imperfect information games reward inference, bluffing, and risk management.
