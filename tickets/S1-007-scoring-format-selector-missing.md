---
id: S1-007
severity: S1
category: football-accuracy
title: "No scoring format selector on 3 standalone analytical pages"
status: open
audit: DEEP-AUDIT-TICKETS.md
---

# S1-007: No scoring format selector on some standalone pages

## Finding

Many standalone analytical pages default to PPR scoring without offering a Half-PPR or Standard toggle. Dynasty leagues use various scoring formats.

## Root Cause Investigation

**Pages WITH scoring format selectors** (PPR/Half/Standard tabs):
- `frontend/efficiency.html` — lines 100-126 (`.eff-scoring-tabs`)
- `frontend/consistency.html` — lines 100-126 (`.con-scoring-tabs`)
- `frontend/vorp.html` — lines 100-126 (`.vorp-scoring-tabs`)
- `frontend/reportcard.html` — lines 100-126 (`.rc-scoring-tabs`)
- `frontend/stocks.html` — lines 100-126 (`.stk-scoring-tabs`)

**Pages MISSING scoring format selectors** (confirmed by investigation):
1. **`frontend/schedule.html`** — No scoring toggle. Only has position filter tabs.
2. **`frontend/opportunity.html`** — No scoring toggle. Only has position filter tabs.
3. **`frontend/awards.html`** — No scoring toggle. Only has position filter tabs and season selector.

All three use PPR fantasy points by default in their API calls and backend queries.

## Fix

Add PPR/Half-PPR/Standard scoring tabs to:
1. `frontend/schedule.html` — SOS calculations depend on fantasy points allowed by defense
2. `frontend/opportunity.html` — Opportunity share and dominator rating use fantasy point rankings
3. `frontend/awards.html` — Season superlatives (MVP, Most Efficient, etc.) are scoring-format-sensitive

Follow the pattern established in efficiency.html (lines 100-126) for consistent UI.

Backend endpoints `/api/strength-of-schedule`, `/api/opportunity-share`, `/api/season-awards` need to accept a `scoring` parameter (ppr/half/standard) and adjust queries accordingly.

## Impact

Half-PPR is the most common dynasty scoring format. Users seeing PPR-only rankings may not trust the data for their league context.

## Acceptance Criteria

- [ ] schedule.html has PPR/Half-PPR/Standard scoring tabs
- [ ] opportunity.html has PPR/Half-PPR/Standard scoring tabs
- [ ] awards.html has PPR/Half-PPR/Standard scoring tabs
- [ ] Backend endpoints accept `scoring` parameter and return format-specific data
