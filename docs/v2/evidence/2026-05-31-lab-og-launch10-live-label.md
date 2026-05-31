# Evidence — Lab L5 launch-10 OG live label (2026-05-31)

**Atom:** `lab-og-launch10-live-label`  
**Route:** `apps/web/app/og/[panel]/route.tsx`

## Change

- `showingLiveData` / `showingDemoRows` — blurb suffix keys off displayed row source after position filter.
- `LAUNCH_10_OG_SLUGS` + `panelBlurbSuffix()` — launch-10 live cards omit `sample preview` and extra `live data` suffix; demo fallback still labeled.

## Gate C — curl

```text
rankings: 200 59509
breakouts: 200 60649
```

PNG ≥40KB, 1200×630.

## Verdict

**PASS** — FACTORY-DOD Gate C2/C3 for launch-10 OG panels.
