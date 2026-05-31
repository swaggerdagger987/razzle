# Evidence — Lab L5 OG panel-native stickers (staff picks batch)

**Date:** 2026-05-31  
**Slice:** `lab-og-live-sticker-launch10-staff-picks`  
**Atom:** 1/3 — rankings + tradevalues + breakouts

## Acceptance

```text
npm run build --workspace=apps/web  → exit 0
curl /og/rankings?download=1         → 200 64632
curl /og/tradevalues?download=1      → 200 65600
curl /og/breakouts?download=1        → 200 64459
file                                 → PNG 1200×630 each
```

## Change

- `launch10LiveStickerLabel` / `launch10SampleStickerLabel` / `launch10LiveBlurbSuffix` panel-native for rankings, tradevalues, breakouts.

## Verdict

**PASS** — FACTORY-DOD Gate C2/C3.
