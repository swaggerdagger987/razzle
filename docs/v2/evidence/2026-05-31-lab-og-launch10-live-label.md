# Evidence — Lab OG launch-10 live label cleanup (2026-05-31)

**Atom:** `lab-og-launch10-live-label` (refines merged `7066f4ab` live-data blurb)

## Change

- `namedLiveRows` filters empty names before live vs demo.
- `ogBlurbSuffix()` — no suffix when live rows render (drops redundant `· live data`).

## Commands

```
npm run build --workspace=apps/web → exit 0
curl /og/rankings?download=1 → 200 59509 PNG
curl /og/breakouts?download=1 → 200 60649 PNG
```

## Verdict

PASS — Gate C2/C3.
