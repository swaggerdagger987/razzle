<!-- PM: ready -->
---
id: DQ-415e
parent: 415 (Bureau Terminology Epic)
priority: P1
area: all frontend files
section: copy consistency
type: verification
status: open
depends_on: DQ-415b, DQ-415c, DQ-415d
---

# Final sweep: no "League Intel" display text remains anywhere

## What to do

```bash
grep -rn "League Intel" frontend/
grep -rn "League Intel" docs/
```

Should return zero matches for displayed text. URL references (`href="/league-intel.html"`) are intentionally kept.

Also check backend and docs for stale references:
```bash
grep -rn "League Intel" backend/
grep -rn "League Intel" docs/DESIGN.md docs/ROADMAP.md
```

## Accept when

- Zero "League Intel" as displayed text anywhere on the site
- URL `/league-intel.html` still works (filename NOT renamed)
- docs/DESIGN.md updated if it references "League Intel"
