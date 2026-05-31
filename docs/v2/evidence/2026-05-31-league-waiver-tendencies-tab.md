# Evidence — league-waiver-tendencies-tab (2026-05-31)

## Slice

Waiver Tendencies tab unhidden with Hawkeye transaction pattern renderer.

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test pytest apps/api/tests -q` | 51 passed, 5 skipped |
| `HIDDEN_BUREAU_SLUGS` Set line | only `strength-of-schedule` — waiver-tendencies removed |

## Reality

PASS — bespoke `BureauWaiverTendencies` wired in `BureauFeatureBody`; slug visible in nav.

## Trust

T2 (hallway links to Room), T5 (shareable league context), T6 (screenshot-worthy archetype grid).
