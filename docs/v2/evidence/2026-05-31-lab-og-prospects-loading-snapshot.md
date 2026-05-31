# Evidence — Lab L5 prospects loading-state sample snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-prospects-loading-snapshot`  
**Content commit:** (filled after standup commit)

## Gate C — curl

```bash
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1&snapshot=eyJyIjpbeyJuIjoiVHJhdmlzIEh1bnRlciIsInAiOiJXUiIsInQiOiJKQVgiLCJzIjo5NCwic2wiOiJSUFMifV19'
# 200 50038

curl -s -o /tmp/og-prospects-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1&force_demo=1'
# 200 63453
```

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/prospects?download=1&snapshot=…` | 200 | 50038 | PASS — FROM PANEL snapshot row |
| `/og/prospects?download=1&force_demo=1` | 200 | 63453 | PASS — demo RPS board |

## Tests

- `pytest apps/api/tests/test_lab_og_export_link.py apps/api/tests/test_og_prospects_loading_snapshot.py` — 14 passed
- `npm run build --workspace=apps/web` — exit 0

## Change

- `ProspectsRenderer.tsx` — `PROSPECTS_SAMPLE_OG_ROWS` on loading + empty board (`export sample card`)
- pytest guards mirror weekly/rankings empty-board pattern

**Verdict:** PASS — prospects export preview works while panel is still pulling film; Lab L5 live-rows epic 3/3 complete.
