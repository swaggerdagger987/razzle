---
id: DQ-476
title: regression.html is an orphan duplicate of tdregression.html
priority: P3
category: code-cleanup
status: open
cycle: 60
---

## Problem

Two HTML files exist for the same "TD Regression" feature:
- `regression.html` (727 lines) — title "TD Regression Finder"
- `tdregression.html` (335 lines) — title "TD Regression Candidates"

Both have the same redirect: `window.location.replace('/lab.html?panel=tdregression');`

Neither is linked from the home page footer or tools hub. Both are standalone panel pages designed to be loaded as iframes in the Lab. Having two files for the same feature:
- Doubles maintenance burden
- Creates SEO confusion (two canonical URLs for same content)
- May cause inconsistent behavior if one gets updated but not the other

## Evidence

```bash
wc -l frontend/regression.html frontend/tdregression.html
#  727 frontend/regression.html
#  335 frontend/tdregression.html
```

Both redirect to `lab.html?panel=tdregression`. The `regression.html` file is likely the older version that was superseded by `tdregression.html` during Phase 132 but never deleted.

## Fix

1. Determine which file is the canonical one (likely `tdregression.html` since it matches the panel name)
2. Delete the orphan (`regression.html`)
3. If any page links to `/regression.html`, update the link to `/tdregression.html`

## Files
- `frontend/regression.html` (delete)
- `frontend/tdregression.html` (keep)
