<<<<<<< HEAD
# Evidence — lab-og-gamelog-player-default

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Cycle:** 122
=======
# Evidence — lab-og-gamelog-player-default (cycle 129)

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-player-default`  
**Gate C:** `/og/gamelog` export path
>>>>>>> origin/razzle-v2-redesign

## Curl

```bash
<<<<<<< HEAD
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test-secret python3 -m pytest apps/api/tests -q  # 58 passed, 5 skipped
curl -s -o /tmp/gamelog-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1'
# 200 60634
curl -s -o /tmp/gamelog-og-id.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900'
# 200 60634
file /tmp/gamelog-og.png  # PNG 1200x630
```

## Change

`LabOgExportLink` injects `DEFAULT_LAB_OG_PLAYER_ID` for player-scoped Lab slugs (including gamelog) when callers omit `playerId`, so export hrefs always carry an explicit `player_id` query param.

## Verdict

PASS — FACTORY-DOD Gate C (PNG ≥ 40KB, live week layout).
=======
curl -s -o /tmp/gamelog-og.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3001/og/gamelog?download=1&player_id=00-0036900"
# 200 60634 — PNG 1200×630
```

## Contract

- `LabOgExportLink` sets `player_id=00-0036900` when slug is `gamelog` or `dynasty-comps` and `playerId` is omitted.
- Complements cycle 128 empty-state gamelog export on base (`e37cd230`).

**Verdict:** PASS
>>>>>>> origin/razzle-v2-redesign
