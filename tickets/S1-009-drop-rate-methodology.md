---
id: S1-009
severity: S1
category: football-accuracy
title: "Drop rate uses non-standard PBP definition — needs methodology disclosure"
status: closed
audit: DEEP-AUDIT-TICKETS.md
---

# S1-009: Puka Nacua drop rate methodology is non-standard

## Finding

Nacua's 2025 season shows 129 receptions with 23 drops (17.8% drop rate). This seems high for a player with 77.7% catch rate.

## Root Cause Investigation

**File: `adapters/nflverse_adapter.py:1021-1024`**

The adapter defines drops from play-by-play data with a custom heuristic:

```python
# A drop = incomplete pass (not interception) with air_yards < 15
if not is_complete and not is_interception:
    if air_yards is not None and air_yards < 15:
        ra["drops"] += 1
```

This is NOT the standard NFL/PFF drop definition. Standard drops require a subjective "catchable ball" judgment. This heuristic counts ALL short incomplete passes (under 15 air yards) as drops, which includes:
- Throw-aways
- Passes broken up by defenders
- Batted balls at the line
- Miscommunications/wrong routes

**File: `adapters/nflverse_adapter.py:1105`** — Drop rate computed as `drops / target_count`.

## Fix

1. **Add methodology tooltip** on the drops page (frontend/drops.html) explaining: "Drops = incomplete passes under 15 air yards (excludes interceptions). This is a proxy metric — not equivalent to PFF's subjective drop grades."
2. **Consider using nflverse's `is_incomplete_pass` + `pass_location` fields** for a tighter definition, or checking if nflverse provides an actual `drop` flag.
3. **Optionally**: Rename the column to "Incompletions (short)" to avoid confusion with standard drop stats.

## Impact

Dynasty managers using the drops page to evaluate receivers may get a misleading picture. Nacua's 23 "drops" may include 10+ contested catches or throw-aways. Users comparing Razzle's drop data to PFF will see different numbers and question accuracy.

## Acceptance Criteria

- [x] Drops page includes methodology note explaining the heuristic — expandable panel added
- [x] Drop definition documented in a tooltip or info icon on the page — both title tooltip and click-to-expand note
- [ ] Consider tightening the heuristic or using nflverse's drop flag if available — deferred, nflverse PBP doesn't have a drop flag
