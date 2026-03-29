---
id: S1-021
severity: S1
category: backend
title: Puka Nacua 2025 drop rate (17.8%) — investigate if inflated by nflverse definition
source: deep-audit
status: open
---

## Problem

Nacua's 2025 season shows 129 receptions with 23 drops (17.8% drop rate). For a player with 77.7% catch rate, this seems contradictory. 166 targets * (1 - 0.777) = ~37 incompletions, meaning 23 of 37 incompletions were drops (62%). This is plausible but worth investigating — nflverse may count contested catches or throwaways differently.

## Root Cause (UPDATED 2026-03-29 — code investigation)

**DROPS ARE DERIVED, NOT IMPORTED DIRECTLY**

**Drop detection logic** — `adapters/nflverse_adapter.py:1021-1024`:
The adapter derives drops from PBP by counting plays where:
- Pass is incomplete (`complete_pass == 0`)
- NOT an interception
- `air_yards < 15`

This is a **custom heuristic**, not an official nflverse stat. It over-counts drops by including:
- Passes not actually catchable by the receiver
- Balls thrown behind/away from the receiver
- QB decision errors (throwing to covered receivers)
- Contested passes where the defender made a play

**Drop rate calculation** — `adapters/nflverse_adapter.py:1105`:
```python
dr = round(a["drops"] / a["target_count"], 3) if a["target_count"] > 0 else None
```

**Drop rate display** — `backend/live_data/tools.py:2722-2810` (`fetch_drop_rate()`):
Queries pre-calculated `drops` and `drop_rate` from `player_season_pbp` table (line 2746).

**Methodology tooltip EXISTS** — `frontend/drops.html:97-98`:
```html
<div class="dr-methodology" title="nflverse play-by-play data attributes drops to the intended target on any incomplete pass where the receiver had an opportunity to catch. This is broader than manually charted drops (e.g. PFF) which only count catchable balls that hit the receiver's hands.">
  drop data via nflverse PBP — includes all targetable incompletions (?)
</div>
```
The tooltip IS present but only visible on hover — not prominently displayed.

**Key issue**: The 15-yard air_yards threshold (`adapter.py:1024`) means deep incompletions aren't counted as drops, but anything under 15 yards that's incomplete and not intercepted is — regardless of whether the pass was actually catchable.

## Fix

1. Verify Nacua's drop count against a second source (Pro Football Reference, etc.)
2. If nflverse's drop definition is broader, add a methodology tooltip: "Drops per nflverse PBP data — includes contested targets"
3. If the data is genuinely wrong, investigate the PBP adapter's drop attribution logic

## Accept When

- Nacua's drop count is verified against an external source
- If the definition differs from traditional, a tooltip explains the methodology
- Drop rate page accurately reflects the data source's definition
