# Evidence — lab-og-live-demo-fallback-copy

**Date:** 2026-05-31  
**Atom:** `lab-og-live-demo-fallback-copy`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Commands

```bash
npm run build --workspace=apps/web
npm run start --workspace=apps/web -- -p 3000
curl -s -o /tmp/og-rankings-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1&preview=demo'
```

## Results

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/rankings?download=1&preview=demo` | 200 | 62355 | 1200×630 |

## Notes

- Terracotta `#d97757` SAMPLE sticker (`SAMPLE · not live data`) on Launch-10 demo rows; teal `#2ec4b6` LIVE sticker unchanged.
- `preview=demo` query forces demo rows for OG QA without disabling live path in production.
- Epic atom 3/3 — completes Lab L5 OG live-rows epic.
