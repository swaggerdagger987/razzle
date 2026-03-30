---
id: DQ-308
title: Smart filters hidden in tiny dropdown with no explanation
priority: P2
category: discoverability
page: lab.html
---

## Problem
The Lab has powerful pre-built "smart filters" (Breakout Candidates, Buy Low, Sell High, etc.) accessible via a small `<select>` dropdown in the filter bar (~line 3445-3453). Problems:

1. The dropdown is visually identical to other filter dropdowns — no special treatment
2. No tooltip, label, or hint explains what smart filters do
3. The home page links to `?sf=breakout` etc. via chips, but users who arrive at /lab.html directly never discover these
4. Smart filters are the "killer feature" for Reddit screenshots but they're the hardest feature to find

## Expected
Smart filters should be visually prominent. Either: a dedicated "Smart Filters" button with a dropdown that explains each filter, or a row of filter chips (like the home page) visible in the Lab toolbar.

## Fix
Option A: Add a row of smart filter chips above the table (styled like home page discovery chips).
Option B: Add a "Smart Filters" button with an icon and a dropdown that shows filter name + one-line description.

## Files
- `frontend/lab.js` — smart filter dropdown rendering (~line 3445-3453)
- `frontend/lab.html` — toolbar area
