# Evidence — lab-breakouts-empty-export

**Date:** 2026-05-31  
**Atom:** `lab-breakouts-empty-export`  
**Epic:** Lab L5 — launch-10 empty OG sample exports (remaining) (atom 1/5)

## Commands

```bash
JWT_SECRET=test pytest apps/api/tests/test_lab_og_export_link.py -q --noconftest
npm run build --workspace=apps/web
curl -s -o /tmp/og-breakouts-snap.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/breakouts?download=1&position=TE&snapshot=<BREAKOUTS_SAMPLE_OG_ROWS>'
curl -s -o /tmp/og-breakouts-live.png -w '%{http_code} %{size_download}' \
  'http://127.0.0.1:3000/og/breakouts?download=1&position=WR'
```

## Results

| Check | Result |
|-------|--------|
| pytest | 8 passed |
| web build | exit 0 |
| snapshot curl (empty-board export path) | `200 39450` PNG 1200×630 |
| live WR board | `200 68849` |

**Reality:** PASS — Gate C. Empty breakouts filter exports sample RBS rows via snapshot; live WR path ≥40KB.
