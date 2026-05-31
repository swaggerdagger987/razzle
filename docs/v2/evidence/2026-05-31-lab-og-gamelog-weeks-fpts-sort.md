# Evidence — lab-og-gamelog-weeks-fpts-sort

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-weeks-fpts-sort`  
**Cycle:** 117

## Acceptance

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 55 passed, 5 skipped
curl -s -o /tmp/gamelog-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900'
# 200 61129
file /tmp/gamelog-og.png  # PNG 1200x630
```

## Change

`extractGamelogWeekRows` in `/og/[panel]` maps API `weeks[]` to OG rows (`Wk N`, PPR sort) matching `GamelogRenderer` snapshot export — live fetch no longer falls back to demo players.

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB, live week layout).
