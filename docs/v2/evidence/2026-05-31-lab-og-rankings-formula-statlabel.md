# Evidence — Lab L5 OG rankings formula stat label

**Date:** 2026-05-31  
**Atom:** `lab-og-rankings-formula-statlabel`  
**Verdict:** PASS

## Changes

- `DynastyRankingsRenderer.tsx` — `ogSnapshotRows` uses `formula?.name ?? "Value"` (matches Trade Values / Breakouts pattern)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3001/og/rankings?download=1'
# 200 59509
```

PNG verified ≥ 40KB.
