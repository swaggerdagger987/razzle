---
id: DQ-373
title: Page size 50/100 options display in dropdown but JS silently rejects them
priority: P2
category: UX / regression
page: lab.html
status: open
cycle: 49
---

## Problem

DQ-151 (done) added 50 and 100 options to the page size dropdown. But `lab.js:3142` restricts accepted values to `[25]` only:

```javascript
if (![25].includes(size)) return;
```

A user selects "50" from the dropdown, nothing happens. No feedback, no error, no change. The dropdown resets to 25 silently. This is a UX trap — the control looks functional but isn't.

## Evidence

- `lab.html:3507-3511`: HTML shows options for 25, 50, 100
- `lab.js:3142`: `if (![25].includes(size)) return;` — silently rejects 50 and 100
- Comment in PROGRESS.md: "changePageSize restricted to [25]: intentional (Ship Loop item 7 — prevents slow loads)"

## Fix

Either:
**Option A** (recommended): Remove 50/100 from the HTML dropdown since they're intentionally blocked:
```html
<select ...>
  <option value="25">25</option>
</select>
```

**Option B**: Enable 50/100 by updating the JS validation:
```javascript
if (![25, 50, 100].includes(size)) return;
```

Option A is safer — if 50/100 were blocked for performance, don't show them. A single-option dropdown is weird but honest. Even better: remove the dropdown entirely and just show "25 per page" as text.

## Verification

Open Lab screener. If Option A: dropdown should only show 25 (or be removed). If Option B: selecting 50 should actually load 50 rows.
