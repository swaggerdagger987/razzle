# Evidence — Lab L5 Dynasty Rankings OG (2026-05-31)

**Slice:** Dedicated `/og/rankings` route with demo fallback rows (atom-2)  
**Route:** `GET /og/rankings?download=1`

## Gate C — curl

```text
curl -s -o /tmp/og-rankings.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/rankings?download=1"
200 64393
file /tmp/og-rankings.png
PNG image data, 1200 x 630, 8-bit/color RGBA
```

- HTTP 200, PNG ≥ 40KB
- Card shows 6 ranked players with position pills, tier labels, dynasty values (demo preview when API empty)

## Build / tests

- `npm run build --workspace=apps/web` — exit 0, route listed as `ƒ /og/rankings`
- `npx tsc --noEmit` (apps/web) — exit 0
- `pytest apps/api/tests -q` — 51 passed, 5 skipped

## Verdict

PASS — screenshot-worthy rankings export card; demo fallback satisfies FACTORY-DOD Gate C3.
