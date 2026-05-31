# Evidence — League L5 Waiver Tendencies Bureau tab

**Date:** 2026-05-31  
**Slice:** Unhide `waiver-tendencies` with `BureauWaiverTendencies` Hawkeye renderer

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 52 passed, 4 failed (snapshot env) |
| Tab visible | only `strength-of-schedule` in `HIDDEN_BUREAU_SLUGS` |

**Verdict:** PASS — no OG route this atom.
