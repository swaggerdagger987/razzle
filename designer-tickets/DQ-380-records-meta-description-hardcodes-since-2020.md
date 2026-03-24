---
id: DQ-380
title: records.html meta description hardcodes "since 2020" — will be stale
priority: P3
category: SEO / copy
page: records.html
status: open
cycle: 49
---

## Problem

The meta description for records.html hardcodes a date reference:

```html
<meta name="description" content="Fantasy football record book on razzle.lol. Single-game highs, best season totals, career PPG leaders, and most career points since 2020.">
```

"since 2020" is already slightly wrong — the database has data back to 2015 (per PROGRESS.md Phase 29: "2015-2025 range"). And as time passes, "since 2020" becomes increasingly misleading about the actual data range.

## Evidence

- `records.html:21`: `content="...since 2020."`
- PROGRESS.md Phase 29: "Data Expansion — 2015-2025 range"
- No other standalone page meta descriptions reference a specific start year

## Fix

Replace with a dynamic-friendly description that doesn't hardcode a year:

```html
<meta name="description" content="Fantasy football record book on razzle.lol. Single-game highs, best season totals, career PPG leaders, and most career points across 10+ NFL seasons.">
```

Or simply remove the date reference:
```html
<meta name="description" content="Fantasy football record book on razzle.lol. Single-game highs, best season totals, career PPG leaders, and all-time career points.">
```

## Verification

View page source of records.html. Meta description should not reference a specific year.
