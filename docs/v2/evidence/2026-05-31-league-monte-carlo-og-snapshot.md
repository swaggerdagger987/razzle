# Evidence — league-monte-carlo-og-snapshot (2026-05-31)

## Slice

Monte Carlo Bureau export encodes top-3 playoff odds rows in `snapshot` query param; OG route decodes before API fetch.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed
curl -s -o /tmp/mc-demo.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/monte-carlo?download=1"
# 200 53350

SNAP=<base64url compact odds>
curl -s -o /tmp/mc-snap.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/monte-carlo?download=1&snapshot=$SNAP"
# 200 53487
```

## Verdict

PASS — PNG ≥40KB; snapshot path shows "from your sim board" copy; demo fallback intact.
