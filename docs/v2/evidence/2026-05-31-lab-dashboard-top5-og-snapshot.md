# Evidence — Lab dashboard top5 OG snapshot

**Date:** 2026-05-31  
**Atom:** `lab-dashboard-top5-og-snapshot`  
**Verdict:** PASS

## Build / tests

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=ci-secret ENVIRONMENT=development python3 -m pytest apps/api/tests -q
# 51 passed, 5 skipped
```

## Gate C — OG PNG (localhost:3000)

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/dashboard?download=1&snapshot=…` | 200 | 57413 | PNG 1200×630, top5 Value rows · from your panel |
| `/og/dashboard?download=1` | 200 | 60034 | PNG 1200×630, demo/live fallback |

## Product

- `DynastyDashboardRenderer` `ogSnapshotRows` now prefers `top5` dynasty assets, then risers/fallers movers, then `value_picks` — export card matches hero panel rows.
