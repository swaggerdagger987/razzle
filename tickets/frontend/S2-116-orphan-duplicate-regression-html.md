---
id: S2-116
severity: S2
confidence: HIGH
category: frontend
source: DQ-476
status: OPEN
---

# regression.html is an orphan duplicate of tdregression.html

## Root Cause

`frontend/regression.html` and `frontend/tdregression.html` are two separate files for the same feature (TD Regression analysis). One is likely an older version that was never cleaned up.

## Fix

1. Verify which file is the canonical version (check Lab sidebar links and API calls)
2. Delete the orphan
3. If any external links point to the deleted file, add a redirect

## Files

- `frontend/regression.html` — potential orphan
- `frontend/tdregression.html` — potential canonical version
- `frontend/lab.html` — sidebar link target

## Acceptance Criteria

1. Only one TD Regression page exists
2. Lab sidebar links to the correct one
3. No broken links
