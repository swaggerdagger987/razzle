# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 50 (QA + UX Audit Fixes for Phases 46-49)
## Phase 50: QA + UX Audit — Auto-Generated Fixes
**Exit Criterion**: All CRITICAL and HIGH findings fixed. Input validation on sparklines endpoint. XSS in hover card fixed. Sparkline column removed from PPR default preset. Hover card interaction improved.

- Task 1: PENDING
- Task 2: PENDING
- Task 3: PENDING
- Stage: BUILD

### Task 1: Fix CRITICAL + HIGH backend issues — sparklines input validation
**Status**: PENDING
**Attempts**: 0
**Acceptance**: (Q1) fetch_screener_sparklines validates player_ids is a list, returns empty sparklines for non-list input. (Q2) Season parameter coerced to int with fallback to 0. (M1) All IDs coerced to strings before sorted() cache key. 34 smoke tests pass.

### Task 2: Fix HIGH frontend XSS + hover card interaction
**Status**: PENDING
**Attempts**: 0
**Acceptance**: (Q3) Position text in hover card uses escapeHtml(pos). (M2) Hover card has pointer-events:auto with mouseenter/mouseleave handlers to keep card visible while cursor is over it. Card still dismisses when cursor leaves both name and card.

### Task 3: Fix UX — remove sparkline from PPR preset default + MEDIUM items
**Status**: PENDING
**Attempts**: 0
**Acceptance**: (U1) "trend" column removed from PPR preset columns array (kept in Dynasty preset). (L2) Hover card headshot has descriptive alt text. No console errors.
