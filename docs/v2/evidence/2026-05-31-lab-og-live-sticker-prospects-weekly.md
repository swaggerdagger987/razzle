# Evidence — lab-og-live-sticker-prospects-weekly

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-prospects-weekly`

## Change

`apps/web/app/og/[panel]/route.tsx` — weekly/prospects fetch catalog API before `/api/panels/{slug}`; panel-specific LIVE sticker copy.

## Commands

```bash
npm run build --workspace=apps/web
curl weekly WR → 200 55816
curl prospects WR → 200 51431
```

## Verdict

PASS — Gate C.
