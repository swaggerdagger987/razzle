<!-- PM: ready -->
---
id: DQ-403a
priority: P1
area: frontend HTML
section: navigation
type: nav consistency
status: open
parent: DQ-403
---

# Remove incorrect Screener active class — Batch 1 (A–Dr)

## What's wrong

17 secondary pages incorrectly mark the "Screener" nav link as `class="active"` even though the user is not on the Screener. Only `lab.html` should have Screener active.

## Files (17)

1. `frontend/advantage.html`
2. `frontend/aging.html`
3. `frontend/airyards.html`
4. `frontend/archetypes.html`
5. `frontend/auction.html`
6. `frontend/awards.html`
7. `frontend/breakdown.html`
8. `frontend/breakouts.html`
9. `frontend/buysell.html`
10. `frontend/career.html`
11. `frontend/career-compare.html`
12. `frontend/cheatsheet.html`
13. `frontend/compare.html`
14. `frontend/comptable.html`
15. `frontend/consistency.html`
16. `frontend/dashboard.html`
17. `frontend/draftclass.html`

## Fix

In each file, find the nav `<a>` that links to the Screener (lab.html) and remove `class="active"` from it. The link itself stays — only the active class is removed.

## Verification

After changes, run:
```bash
grep -l 'class="active"' frontend/advantage.html frontend/aging.html frontend/airyards.html frontend/archetypes.html frontend/auction.html frontend/awards.html frontend/breakdown.html frontend/breakouts.html frontend/buysell.html frontend/career.html frontend/career-compare.html frontend/cheatsheet.html frontend/compare.html frontend/comptable.html frontend/consistency.html frontend/dashboard.html frontend/draftclass.html
```
Expected: 0 matches for Screener active class.
