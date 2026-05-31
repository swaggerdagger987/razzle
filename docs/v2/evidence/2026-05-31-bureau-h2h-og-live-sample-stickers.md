# Evidence — bureau-h2h-og-live-sample-stickers

**Date:** 2026-05-31  
**Route:** `/og/head-to-head?download=1`  
**Verdict:** PASS (Gate C)

## Commands

```bash
npm run build --workspace=apps/web
curl -s -o /tmp/og-h2h-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1'
```

## Results

| Check | Result |
|-------|--------|
| web build | exit 0 |
| curl H2H OG demo | `200 76738` |
| PNG | 1200×630, ≥40KB |

## Notes

- Terracotta `SAMPLE · demo rivalry` when demo fallback (no live API).
- Teal `LIVE · Sleeper rivalry` when `/api/bureau/head-to-head` returns you/them.
- Snapshot exports keep subtitle only — sticker skipped to avoid false LIVE on encoded panel data.
