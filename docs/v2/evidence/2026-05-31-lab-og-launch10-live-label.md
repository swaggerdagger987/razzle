# Evidence — Lab L5 OG launch-10 live label (2026-05-31)

**Atom:** `lab-og-launch10-live-label`  
**Verdict:** PASS

## Commands

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
- `curl http://127.0.0.1:3000/og/weekly?download=1` — **200 63819** bytes PNG
- `curl http://127.0.0.1:3000/og/rankings?download=1` — **200 59509** bytes PNG

## Behavior

Launch-10 slugs use `panelBlurbSuffix()`: demo cards keep `· sample preview`; live rows drop sample/live suffix (position filter only).
