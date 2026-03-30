---
id: DES-010
priority: P1
area: sitewide (58+ panel pages)
status: open
created: 2026-03-22
---

# DES-010: 1px solid borders on data table rows — sitewide DESIGN.md violation across 58+ pages

## What's Wrong

64 occurrences of `border-bottom: 1px solid var(--ink-faint)` across 58 panel HTML pages. Examples:

- `advantage.html:48` — `.pa-table td { border-bottom: 1px solid var(--ink-faint); }`
- `airyards.html:189` — `border-bottom: 1px solid var(--ink-faint);`
- `career.html:91` — `border-bottom: 1px solid var(--ink-faint);`
- `compare.html:205` — `border-bottom: 1px solid var(--ink-faint);`
- Plus 54 more files.

DESIGN.md explicitly states:
- **"Don't: Thin 1px borders on primary elements"**
- **"Dashed dividers: 2px dashed var(--ink-faint) inside cards"**

DES-002 covers only the home page mini-screener. This is the same violation at massive scale.

## Why It Matters

Every Lab panel page is a potential screenshot for Reddit/Twitter. The thin 1px borders make data rows look anemic instead of chunky. The design signature is "thick borders, dashed dividers" — 1px solid violates both rules.

## Fix

Global find-and-replace across all panel HTML files:

```
FIND:    border-bottom: 1px solid var(--ink-faint)
REPLACE: border-bottom: 2px dashed var(--ink-faint)
```

58 files affected. Test a few pages visually after to ensure table density is still comfortable.

## Files

All 58 panel HTML files in `frontend/`. Full list from grep:
advantage, airyards, auction, awards, breakdown, breakouts, career, career-compare, cheatsheet, compare, comptable, consistency, dashboard, draftclass, drops, dualthreat, efficiency, fptsbreakdown, gamelog, gamescript, garbagetime, handcuffs, index (mini-screener), lab, leaders, matchups, opportunity, pace, percentiles, player, playoffs, prospects, rankings, recap, records, redzone, regression, reportcard, rosterbuilder, scarcity, schedule, scoring, seasonpace, snapefficiency, stacks, stocks, streaks, strengths, successrate, targetpremium, targets, tdregression, tradefinder, tradevalues, usage, vorp, waivers, weekly, weeklyleaders, weeklymvp, workload, yoy.
