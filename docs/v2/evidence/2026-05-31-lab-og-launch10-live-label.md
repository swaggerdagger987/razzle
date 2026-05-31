# Evidence — Lab L5 OG launch-10 live label (2026-05-31)

**Atom:** `lab-og-launch10-live-label`  
**Route:** `apps/web/app/og/[panel]/route.tsx`

## Change

- `namedLiveRows` filters API rows with non-empty names before choosing live vs demo.
- `usingLiveData` drives row source and `ogBlurbSuffix()` — no `sample preview` when live rows render.
- Demo fallback still appends ` · sample preview` (or dynasty-comps variant) when API empty.

## Commands (2026-05-31)

```
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q → 51 passed, 5 skipped
curl /og/rankings?download=1 → 200 59509 PNG 1200×630
curl /og/breakouts?download=1 → 200 60649 PNG 1200×630
curl /og/weekly?download=1 → 200 63819 PNG (demo path, sample label when API empty)
```

## Verdict

**PASS** — Gate C2/C3: PNG ≥40KB with player row layout; sample label only on demo fallback path.
