# Evidence — Lab OG rankings/breakouts/tradevalues LIVE stickers

**Atom:** `lab-og-live-sticker-rankings-breakouts-tv`  
**Epic:** Lab L5 — Launch-10 OG panel-native LIVE labels (atom 1/3)  
**Date:** 2026-05-31

## Change

- `launch10LiveStickerLabel` + `launch10LiveBlurbSuffix` — rankings `dynasty ranks`, breakouts `RBS board`, tradevalues `value curve`.

## Acceptance

```text
npm run build --workspace=apps/web → exit 0

curl /og/rankings?download=1 → 200 67083 PNG 1200×630
curl /og/breakouts?position=WR&download=1 → 200 68647
curl /og/tradevalues?download=1 → 200 68974
```

## Gate C

PASS — all three routes ≥40KB PNG with demo/live layout.

## Verdict

PASS
