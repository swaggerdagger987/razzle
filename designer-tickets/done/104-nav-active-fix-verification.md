<!-- PM: ready -->
---
id: DQ-403e
priority: P1
area: frontend HTML
section: navigation
type: verification
status: open
parent: DQ-403
depends_on: [DQ-403a, DQ-403b, DQ-403c, DQ-403d]
---

# Verify: zero secondary pages have Screener active class

## What to do

Final sweep after batches 403a-403d. Run:

```bash
grep -rn 'class="active"' frontend/*.html | grep -i screener
```

Expected: only `frontend/lab.html` should match (the actual Screener page).

If any other file still has Screener marked active, fix it and note which batch missed it.

## Also check

- `lab.html` still has `class="active"` on its Screener link (should NOT have been removed)
- No other nav links were accidentally modified
