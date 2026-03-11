# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 50 (QA + UX Audit Fixes for Phases 46-49)
## Phase 50: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All CRITICAL and HIGH findings fixed. Input validation on sparklines endpoint. XSS in hover card fixed. Sparkline column removed from PPR default preset. Hover card interaction improved.

- Task 1: PASS
- Task 2: PASS
- Task 3: PASS
- Stage: COMPLETE
- Next: Phase gate

### Task 1: Fix CRITICAL + HIGH backend issues — sparklines input validation
**Status**: PASS
**Attempts**: 1
**Acceptance**: fetch_screener_sparklines validates player_ids is a list, returns empty sparklines for non-list input. Season coerced to int. All IDs coerced to strings. 34 tests pass.
**Result**: Added isinstance(player_ids, list) check. Added str() coercion on all IDs. Added int(season) with try/except fallback to 0.

### Task 2: Fix HIGH frontend XSS + hover card interaction
**Status**: PASS
**Attempts**: 1
**Acceptance**: Position text in hover card uses escapeHtml(pos). Hover card has pointer-events:auto with stay-on-hover behavior.
**Result**: Added escapeHtml(pos) in hover card. Changed pointer-events to auto (none when not visible). Added onmouseenter/onmouseleave on card div. Added 150ms delay on player name leave to allow cursor travel to card.

### Task 3: Fix UX — remove sparkline from PPR preset default + alt text
**Status**: PASS
**Attempts**: 1
**Acceptance**: "trend" removed from PPR preset. Hover card headshot has descriptive alt text. No console errors.
**Result**: Removed "trend" from PPR columns (kept in Dynasty). Changed alt="" to alt="${escapeAttr(player.full_name)}".
