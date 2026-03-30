---
id: DES-296
title: Demo league shows "DynastyKing2024" and "2024 Season" — stale year
severity: P2
category: Content/Copy
page: league-intel.html
---

## What's Wrong

The Bureau demo league data hardcodes "2024" in two places:
1. Demo username: `"DynastyKing2024"` (line 7364)
2. Demo season label: `"12-team Dynasty Superflex | 2024 Season"` (line 7380)

Current year is 2026. This makes the demo feel abandoned or unmaintained — first impression for users exploring the Bureau without connecting Sleeper.

## Where

- `frontend/league-intel.html` line 7364: `{name: "DynastyKing2024", record: "9-4", ...}`
- `frontend/league-intel.html` line 7380: `"12-team Dynasty Superflex | 2024 Season"`

## Fix

Use a dynamic year or update to current:
```js
const currentYear = new Date().getFullYear();
// Username
{name: "DynastyKing" + currentYear, ...}
// Season label
"12-team Dynasty Superflex | " + currentYear + " Season"
```

Or hardcode "2026" if dynamic feels fragile. Either way, stop showing 2024.

## Evidence

Line 7364: `"DynastyKing2024"` — hardcoded string in demo data array.
Line 7380: `"2024 Season"` — hardcoded in template literal generating HTML.
