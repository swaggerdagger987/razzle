# Evidence — Lab OG slug-specific SAMPLE sticker

**Date:** 2026-05-31  
**Atom:** `lab-og-slug-sample-sticker`  
**Cycle:** 128 (workday cycle 1)

## Change

- `apps/web/app/og/[panel]/route.tsx` — `demoStickerLabel(slug)` for prospects/weekly/generic demo rows; terracotta SAMPLE badge contrasts teal LIVE sticker.

## Commands (executed)

```text
npm run build --workspace=apps/web → exit 0
JWT_SECRET=test-secret pytest apps/api/tests -q → 62 passed, 5 skipped (post base sync)
curl http://127.0.0.1:3000/og/rankings?position=WR&download=1 → 200 58065 bytes PNG
curl http://127.0.0.1:3000/og/buysell?position=WR&download=1 → 200 51950 bytes PNG
```

## Gate C

PASS — both PNGs ≥ 40KB, valid PNG 1200×630.

## Verdict

PASS
