---
id: DQ-475
title: league-intel.html "Yahoo support coming soon" stale undated promise
priority: P2
category: content-accuracy
status: open
cycle: 60
---

## Problem

The Bureau of Intelligence page displays a "Yahoo support coming soon" badge next to the Sleeper connection input. This is an undated feature promise with no timeline, no progress indicator, and no way for users to know if it's actively being worked on or abandoned.

Stale "coming soon" labels erode trust. Users who want Yahoo support will check back, find it still says "coming soon," and lose confidence in the product.

## Evidence

`frontend/league-intel.html` line 1989:
```html
<span style="background:var(--bg-warm);border:2px solid var(--ink-faint);border-radius:8px;padding:2px 8px;margin:0 2px;">Yahoo</span> support coming soon
```

## Fix

Either:
1. **Remove it** if Yahoo support isn't actively planned — don't promise what you can't deliver.
2. **Add a timeline** if it IS planned — e.g., "Yahoo support — Summer 2026"
3. **Replace with a waitlist** — "Want Yahoo support? Let us know" with an email capture.

Option 1 is the safest. Remove the badge and the "support coming soon" text entirely.

## Files
- `frontend/league-intel.html` line 1989
