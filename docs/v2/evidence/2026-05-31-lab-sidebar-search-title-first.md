# Evidence — Lab L2 search title-first labels

**Date:** 2026-05-31  
**Atom:** `lab-sidebar-search-title-first`  
**Epic:** Lab L2 — search labels readable at a glance (atom 1/2)

## Change

- `LabSidebar.tsx`: search results render `Panel title · Agent` (title scannable first) instead of `Agent · Panel` prefix.

## Commands

```text
npm run build --workspace=apps/web → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panel_upgrade_teaser.py -q → 4 passed
```

## Verdict

**PASS** — non-OG slice; Gate C N/A.
