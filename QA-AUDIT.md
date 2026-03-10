# QA + UX Audit — Phases 56-60

**Audit Date**: 2026-03-09
**Phases Covered**: 56 (QA+UX fixes), 57 (Draft Pick Trade Calculator), 58 (Roster Value Calculator), 59 (Player Comp Finder), 60 (Boom/Bust Analyzer)

---

## QA FINDINGS

### CRITICAL

**QA-1: XSS — Unescaped player names in renderPlayerComps (6 locations)**
- **File**: `frontend/lab.js` lines ~7937, 7967, 7969, 7970, 7978, 7980
- **Issue**: `comp.full_name` and `player.full_name` interpolated directly into HTML without `escapeHtml()`. The boom/bust code correctly escapes, but the comps code does not.
- **Fix**: Wrap all 6 occurrences with `escapeHtml()`.

**QA-2: XSS — Unescaped error message in loadPlayerComps**
- **File**: `frontend/lab.js` line ~7889
- **Issue**: `data.error` from API inserted directly into innerHTML. The boom/bust loader correctly uses `escapeHtml()`, but the comps loader does not.
- **Fix**: Change `${data.error}` to `${escapeHtml(data.error)}`.

### HIGH

**QA-3: Missing negative limit validation on /api/players/{id}/comps**
- **File**: `backend/server.py` line 442
- **Issue**: `limit=min(limit, 10)` doesn't guard against negative values. `min(-5, 10) = -5` causes Python `[:−5]` slice to return unexpected results.
- **Fix**: Change to `limit=max(1, min(limit, 10))`.

**QA-4: Redundant inline `import math` in _pick_value**
- **File**: `backend/live_data.py` line ~3247
- **Issue**: `import math` inside `_pick_value()` is redundant — `math` is already imported at module top.
- **Fix**: Remove the inline `import math`.

### MEDIUM

**QA-5: Design system violation — stat card borders in boom/bust**
- **File**: `frontend/lab.js` line ~8388
- **Issue**: Boom/bust stat cards use `border:2px` / `box-shadow:3px 3px 0` instead of design spec `border:3px` / `box-shadow:4px 4px 0`.
- **Fix**: Update border and shadow values.

### LOW

**QA-6: Consistency rank fallback edge case**
- **File**: `backend/live_data.py` — fetch_player_boom_bust
- **Issue**: If player's CSV parsing fails, `position_rank` stays at default 1. Edge case, not a crash.

---

## UX FINDINGS

### CRITICAL

**UX-1: Boom/Bust histogram has no legend**
- **Feature**: Boom/Bust Analyzer (Phase 60)
- **Issue**: Bars colored green/red/position-color with no legend. Users must infer meaning from threshold lines alone.
- **Fix**: Add legend box: "Green = Boom week | Red = Bust week | [Color] = Normal"

### HIGH

**UX-2: Boom/Bust grade badge unexplained**
- **Feature**: Boom/Bust Analyzer (Phase 60)
- **Issue**: Letter grade shown without explaining it measures consistency (inverse coefficient of variation).
- **Fix**: Add subtitle: "Consistency Grade — week-to-week scoring stability"

**UX-3: Roster Value grade and status unexplained**
- **Feature**: Roster Value Calculator (Phase 58)
- **Issue**: Grade (A+ to F) and status (COMPETING/RETOOLING/REBUILDING) shown without criteria explanation.
- **Fix**: Add brief tooltips or explainer text for grade and status criteria.

### MEDIUM

**UX-4: Consistency score computed but not displayed**
- **Feature**: Boom/Bust Analyzer (Phase 60)
- **Issue**: Backend returns `consistency_score` (0-100) but UI only shows letter grade. Number would help cross-player comparison.
- **Fix**: Add consistency score to stat cards row.

**UX-5: Comp similarity % lacks methodology note**
- **Feature**: Player Comp Finder (Phase 59)
- **Issue**: "95% match" is prominent but unexplained. Users don't know it's cosine similarity on per-game stats.
- **Fix**: Add Caveat annotation: "match = per-game stat profile similarity"

**UX-6: Boom/bust definition placement**
- **Feature**: Boom/Bust Analyzer (Phase 60)
- **Issue**: Threshold definition in Caveat font reads as margin note rather than critical info.
- **Fix**: Include thresholds in histogram legend for redundancy.

### LOW

**UX-7: No season switcher for comps** — Nice-to-have, not blocking core flow.
**UX-8: Trade Analyzer pick value chart may require scroll** — Minor friction.

---

## ACTION ITEMS

| Priority | Finding | Action |
|----------|---------|--------|
| CRITICAL | QA-1, QA-2 | Escape all player names + error messages in renderPlayerComps/loadPlayerComps |
| CRITICAL | UX-1 | Add histogram legend to Boom/Bust |
| HIGH | QA-3 | Add negative limit guard on /comps endpoint |
| HIGH | QA-4 | Remove redundant inline `import math` |
| HIGH | UX-2 | Add grade explanation to Boom/Bust |
| HIGH | UX-3 | Add grade/status explanation to Roster Value |
| MEDIUM | QA-5, UX-4, UX-5, UX-6 | Grouped: design fix + consistency score display + comp annotation + definition redundancy |
| LOW | QA-6, UX-7, UX-8 | Logged, not tasked |
