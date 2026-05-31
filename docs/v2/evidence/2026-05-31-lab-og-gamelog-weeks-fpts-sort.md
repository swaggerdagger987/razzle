# Evidence — Lab OG gamelog peak weeks by FPTS

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-weeks-fpts-sort`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped

curl -s -o /tmp/og-gamelog-live.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1&player_id=00-0036900'
# → 200 55055 (post-extractGamelogWeekRows)

file /tmp/og-gamelog-live.png  # PNG 1200x630
```

## Change

`extractGamelogWeekRows` in `apps/web/app/og/[panel]/route.tsx` sorts `weeks[]` by `fpts` desc and renders `Wk N` + PPR — matches `GamelogRenderer` `ogSnapshotRows`. Demo fallback uses week rows, not player names.

## Verdict

PASS — live OG ≥40KB with peak-week layout.
