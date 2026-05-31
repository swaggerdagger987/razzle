# Evidence — Lab OG export links (rankings + breakouts)

**Date:** 2026-05-31  
**Atom:** `lab-og-export-link-rankings-breakouts`

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests -q
curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/rankings?download=1'
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/breakouts?download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| pytest | 51 passed, 5 skipped |
| /og/rankings | 200, 59509 bytes, PNG 1200×630 |
| /og/breakouts | 200, 60649 bytes, PNG 1200×630 |

## Code

- `DynastyRankingsRenderer.tsx` — `LabOgExportLink slug="rankings"`
- `BreakoutsRenderer.tsx` — `LabOgExportLink slug="breakouts"`
