---
title: "Tarot specifications"
introduces: specification
date-created: 2025-12-31
keywords:
  - tarot
type: specification
---


This specification defines how tarot data is encoded for spreads and readings.

## Spread YAML

Required keys:

- `spread`: name of the spread.
- `positions`: ordered list of position definitions.
- `draw`: list of cards drawn with positions.

Each position includes:

- `name`: position label.
- `role`: meaning or function in the spread.

Each draw entry includes:

- `position`: position name.
- `card`: card name.
- `orientation`: `upright` or `reversed`.

Example:

```yaml
spread: three-card
positions:
  - name: past
    role: the background or origin
  - name: present
    role: the current situation
  - name: future
    role: a likely direction
draw:
  - position: past
    card: The Fool
    orientation: upright
  - position: present
    card: Two of Cups
    orientation: upright
  - position: future
    card: The Tower
    orientation: reversed
```
