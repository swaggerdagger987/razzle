# Evidence — Lab rankings empty filter export sample card

**Date:** 2026-05-31  
**Atom:** `lab-rankings-empty-export`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web
JWT_SECRET=test python3 -m pytest apps/api/tests/test_lab_og_export_link.py -q --noconftest
curl -s -o /tmp/og-rankings-empty.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/rankings?download=1&position=TE&snapshot=W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MSwic2wiOiJSYW5rIn1d'
```

## Results

- pytest: 5 passed (includes `test_rankings_empty_filter_exports_sample_card`)
- curl: `200 49412` — PNG 1200×630
- Gate C: ≥40KB with sample row layout on zero-filter board
