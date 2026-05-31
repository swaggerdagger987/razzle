# Evidence — league-sos-og-export (2026-05-31)

## Slice

Bureau Schedule (`strength-of-schedule`) OG share card with in-panel snapshot encoding.

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
curl -s -o /tmp/og-sos.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/strength-of-schedule?download=1'
  → 200 58624
```

## Verdict

PASS — Bureau Schedule export card is screenshot-ready (≥40KB PNG).
