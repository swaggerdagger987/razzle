# Evidence — lab-og-live-demo-fallback-copy

**Date:** 2026-05-31  
**Routes:** `/og/rankings?download=1&force_demo=1`, `/og/weekly?download=1`  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-rankings-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1&force_demo=1'
curl -s -o /tmp/og-weekly-live.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| curl rankings force_demo | `200 66345` |
| curl weekly (live or demo) | `200 63522` |
| PNG | 1200×630, ≥40KB |

## Notes

- Terracotta Caveat `SAMPLE · demo rows only` sticker on Launch-10 when `showingDemoRows`.
- Teal `LIVE · nflverse rows` unchanged — opposite rotation for screenshot contrast.
- `force_demo=1` query skips live fetch for QA curl only; natural demo path unchanged.
