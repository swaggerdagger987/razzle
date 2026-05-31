# Evidence — league-waiver-tendencies-tab (2026-05-31)

## Slice

Waiver Tendencies Bureau tab unhidden with Hawkeye transaction-pattern cards.

## Acceptance

| Command | Result |
|---------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 51 passed, 5 skipped |
| Hidden slug check | `waiver-tendencies` removed from `HIDDEN_BUREAU_SLUGS` |

## Files

- `apps/web/components/league/BureauWaiverTendencies.tsx` — Hawkeye header, league waiver shape strip, pickup lens hero, per-team cards (adds/drops/FAAB/archetype)
- `apps/web/components/league/BureauFeatureBody.tsx` — wire renderer
- `apps/web/lib/bureau-features.ts` — unhide slug

## Verdict

PASS — Bureau behavioral tab visible in nav; API `/api/bureau/waiver-tendencies` unchanged.
