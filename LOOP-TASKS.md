# Razzle Loop — Phase 95 Task List

> QA + UX Audit — Auto-Generated Fixes (Phases 91-94)

**Current Phase**: 95 — QA + UX Audit Fixes
**Exit Criterion**: All HIGH and MEDIUM findings from QA-AUDIT.md (Phases 91-94) resolved. Trade value chart + trade finder queries filter on fantasy_relevant. Trade finder percentile computation pre-sorted. Trade finder stock scoring matches stock watch 4-factor model or documented. Trade finder "player not found" error provides helpful context message. Verified with syntax checks and structural validation.

---

## Task 1: HIGH fix — Trade Finder helpful error for missing players (UX-1)
**Status**: PENDING
**Attempts**: 0
**Notes**: Show specific "min 4 games / 2 PPG" message when player not in trade pool. Consider showing basic player info even without trade data.

## Task 2: MEDIUM fix — Add fantasy_relevant filter to trade value + trade finder (QA-1)
**Status**: PENDING
**Attempts**: 0
**Notes**: Add `AND p.fantasy_relevant = 1` to fetch_trade_value_chart and fetch_trade_finder SQL queries.

## Task 3: MEDIUM fix — Pre-sort percentile_rank in trade finder (QA-2)
**Status**: PENDING
**Attempts**: 0
**Notes**: Pre-sort PPO/CoV/PPG values once, use bisect for O(log N) lookups instead of re-sorting per player.

## Task 4: MEDIUM fix — Align trade finder stock scoring with 4-factor model (QA-3)
**Status**: PENDING
**Attempts**: 0
**Notes**: Either add SOS computation to trade finder or document the 3-factor simplification. 4-factor preferred for consistency with /stocks.html.

## Task 5: MEDIUM grouped — LOW findings (QA-4, QA-5, UX-3, UX-4)
**Status**: PENDING
**Attempts**: 0
**Notes**: Deduplicate trade finder results across sections. VORP `name` → `full_name` consistency. Trade finder contextual empty-state messages. VORP replacement section count adaptive to position filter.

## Task 6: Smoke test
**Status**: PENDING
**Attempts**: 0
**Notes**:

---

## Loop State
```
Current Phase: 95
Current Task: 1
Current Stage: BUILD
Attempt: 1
Tasks Completed: 0/6
```
