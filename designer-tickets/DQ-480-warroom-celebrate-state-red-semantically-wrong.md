---
id: DQ-480
title: warroom.js CELEBRATE state uses red color — semantically wrong for positive event
priority: P3
category: color-semantics
status: open
cycle: 60
---

## Problem

When a pixel agent enters the CELEBRATE state (after completing a successful analysis), their HUD dot color is `#cc3333` — a red color. Red universally signals danger, error, or urgency. A celebration is a positive event and should use a positive color.

This is a subset of DQ-471 (HUD state colors off-palette) but called out separately because it's a semantic error, not just a palette mismatch. The wrong color actively misleads — a user watching the pixel agents might think the red dot means something went wrong.

## Evidence

`frontend/warroom.js` line 1256:
```javascript
else if (a.state === STATE.CELEBRATE) dotColor = '#cc3333';
```

The CELEBRATE state triggers when an agent completes analysis successfully. The Razzle design guide associates:
- Red (`--red: #e63946`) = "Urgent signals, negative stats"
- Green (`--green: #2ec4b6`) = "Positive signals"
- Yellow (`--yellow: #ffc857`) = "Highlights, warmth"

## Fix

Change the celebrate color to green (positive) or yellow (highlight/warmth):

```javascript
else if (a.state === STATE.CELEBRATE) dotColor = '#2ec4b6'; // green = positive
```

## Files
- `frontend/warroom.js` line 1256
