# Evidence — Lab OG LIVE sticker prospects + weekly (panel API)

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-prospects-weekly`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/prospects?position=WR&download=1` | 200 | 51431 | PNG 1200×630 |
| `/og/weekly?position=WR&download=1` | 200 | 55816 | PNG 1200×630 |

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test-secret python3 -m pytest apps/api/tests -q  # 55 passed, 5 skipped
curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?position=WR&download=1'
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?position=WR&download=1'
```

## Layer claim

Lab L5 — prospects/weekly OG cards show slug-specific LIVE stickers only when `/api/panels` returns live rows (not legacy-path fallback or demo).
