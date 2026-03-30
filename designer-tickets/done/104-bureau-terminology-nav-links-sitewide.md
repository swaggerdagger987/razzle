<!-- PM: ready -->
---
id: DQ-415b
parent: 415 (Bureau Terminology Epic)
priority: P1
area: all frontend HTML files
section: topnav
type: copy consistency
status: open
depends_on: DQ-415a
---

# Rename "League Intel" nav link to "Bureau" across all pages

## What to do

Search all `frontend/*.html` files for the nav link text "League Intel" and replace with "Bureau":

```bash
grep -rn "League Intel" frontend/*.html
```

The nav link should read "Bureau" (short form for nav) and still point to `/league-intel.html`.

**Do NOT rename the filename** `league-intel.html` — URL stability matters more than naming purity.

## Accept when

- `grep -i "league intel" frontend/*.html` returns zero matches in nav elements
- Nav link text reads "Bureau" on all pages
- Link still points to `/league-intel.html`
