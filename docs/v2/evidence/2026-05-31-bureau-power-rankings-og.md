# Evidence — Bureau Power Rankings OG share card

**Cycle:** 82 (workday cycle 1 — good morning)  
**Atom:** `league-power-rankings-og`  
**Slice:** League L5 — `/og/power-rankings` with demo fallback + Bureau export link

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0; route listed as `/og/power-rankings` |
| `JWT_SECRET=test pytest apps/api/tests -q` | 51 passed, 5 skipped |
| Gate C2 curl | `curl /og/power-rankings?download=1` → **200 59358** bytes |
| PNG format | `file` → PNG 1200×630 RGBA |
| Demo rows | Four teams with diff bars + luck when no `league` param |
| In-product export | `BureauPowerRankings` footer `export card` link with `league` param |

## Verdict

PASS — screenshot-ready Bureau power board OG card (FACTORY-DOD Gate C).
