# Evidence — explore-og-college-export-filename (2026-05-31)

## Commands

- `JWT_SECRET=test python3 -m pytest apps/api/tests/test_explore_share_og_universe.py -q` → 2 passed
- `npm run build --workspace=apps/web` → exit 0

## Verdict

PASS — ShareButton-only slice; college `download={exportFileName}`.
