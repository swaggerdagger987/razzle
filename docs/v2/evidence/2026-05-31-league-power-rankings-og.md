# Evidence — 2026-05-31 league-power-rankings-og

**Slice:** OG share card at `/og/power-rankings` with demo fallback + Bureau export row  
**Atom:** `league-power-rankings-og` (League L5 epic atom 2/4)

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-pr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1&league=test'
file /tmp/og-pr.png
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 54939 bytes (≥40KB) |
| Format | PNG 1200×630 |
| Demo rows | 3 teams (#1 Dynasty Dukes …) when API empty |

**Verdict:** PASS — FACTORY-DOD Gate C2 satisfied.

## Build

- `npm run build --workspace=apps/web` — exit 0, route listed `ƒ /og/power-rankings`
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
