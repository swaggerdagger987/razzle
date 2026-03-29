---
id: S2-033
severity: S2
category: ux
title: CSV export Pro-locked with no preview — free users see greyed button with no value demonstration
source: deep-audit
status: open
duplicate-of: S2-012
---

## Problem

Free users see greyed-out CSV buttons with lock icons and no sample export. If screenshots are the growth engine (North Star), locking PNG export for free users contradicts the viral distribution flywheel. CSV gating is reasonable, but there should be a taste of what they'd get.

## Root Cause

**CSV export gating** — `frontend/lab.js:6009`:
```js
if (typeof isPaidUser === "function" && !isPaidUser()) { ... }
```

**PNG export is NOT gated** — `frontend/lab.js:5799` has no `isPaidUser()` check. Free users CAN download PNGs. The "Download PNG" button at `lab.html:3640` is available to all users.

So the "every screenshot is a billboard" philosophy IS working for PNGs. The issue is limited to CSV export showing a greyed button with no value demonstration.

## Fix

1. Consider allowing free users to export limited CSV (top 10 rows) with "Upgrade for full export" appended
2. Or improve the locked CSV button UX — instead of just "CSV export requires Pro", show what they'd get: "Export all 247 rows as CSV — Pro feature"

## Accept When

- CSV lock message communicates the value being unlocked (row count, data scope)
- PNG export confirmed working for free users (already the case)
