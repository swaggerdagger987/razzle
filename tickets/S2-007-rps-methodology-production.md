---
id: S2-007
severity: S2
category: football-accuracy
title: "RPS prospect score excludes college production — methodology concern"
status: open
audit: DEEP-AUDIT-TICKETS.md
decomposed-to: backend/S2-028-prospects-rps-ignores-production.md
---

# S2-007: Prospects page RPS methodology excludes production

## Finding

RPS (Razzle Prospect Score) weights athleticism 60%, draft capital 30%, size 10%. College production is not included.

## Root Cause

**File: `frontend/prospects.html:373`** — Methodology display:
```
ranked by RPS (Razzle Prospect Score) — athleticism 60% + draft capital 30% + size 10%
```

**File: `frontend/lab.js:8483`** — Actual computation:
```javascript
rps = athleticAvg * 0.6 + draftCapital * 0.3 + sizeScore * 0.1;
```

No production metric (college PPG, dominator rating, breakout age) is factored into RPS.

## Assessment

This is a methodology debate, not a bug. The current approach favors measurable physical traits and draft capital. Adding production would capture players like Davante Adams (mid-round, average athleticism, elite production) but also introduces noise from small-school stat inflation.

**Suggested enhancement**: Add a separate "Production Score" column alongside RPS, or create a "Composite" score that includes both. Let users sort by either.

## Impact

Dynasty managers trusting RPS for rookie drafts may over-draft raw athletes. The methodology is transparent but could be improved.

## Acceptance Criteria

- [ ] Consider adding production component to RPS or as separate sortable column
- [ ] If RPS methodology changes, update prospects.html:373 and lab.js:8483
