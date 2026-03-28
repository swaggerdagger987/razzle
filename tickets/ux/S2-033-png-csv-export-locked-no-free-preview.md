---
id: S2-033
severity: S2
category: ux
title: CSV export Pro-locked with no preview — free users see greyed button with no value demonstration
source: deep-audit
status: open
---

## Problem

Free users see greyed-out CSV buttons with lock icons and no sample export. If screenshots are the growth engine (North Star), locking PNG export for free users contradicts the viral distribution flywheel. CSV gating is reasonable, but there should be a taste of what they'd get.

## Root Cause

**CSV export gating** — `frontend/lab.js:42`:
```js
if (typeof isPaidUser === "function" && !isPaidUser()) {
  _showToast('CSV export requires Pro.', 'warning', ...);
  return;
}
```

**PNG export** appears to work for free users (screener screenshots), but CSV is fully locked.

## Fix Options

1. Allow free users to export limited CSV (top 10 rows only) with a "Upgrade for full export" note in the file
2. Allow free users to export watermarked PNGs (already the case?) — verify this works
3. Show a preview of what the CSV would contain (first 5 rows visible, rest blurred)

## Accept When

- Free users get some form of export to share/screenshot (at minimum watermarked PNG)
- The export lock communicates what Pro unlocks, not just "no"
