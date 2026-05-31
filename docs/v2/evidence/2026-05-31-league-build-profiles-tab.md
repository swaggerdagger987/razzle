# Evidence — league-build-profiles-tab

**Date:** 2026-05-31  
**Atom:** Unhide build-profiles Bureau tab with Atlas roster-archetype renderer  
**Verdict:** PASS (in-product Bureau; no OG route this atom)

## Acceptance

| Command | Result |
|---------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test python3 -m pytest apps/api/tests/test_bureau_self_scout.py -q` | 2 passed |

## Product verification

- `build-profiles` removed from `HIDDEN_BUREAU_SLUGS` — nav shows Build Profiles.
- `BureauFeatureBody` routes to `BureauBuildProfiles` with Atlas header, archetype chips, per-team cards.
- `/league/[id]/build-profiles` no longer 404 via hidden-slug gate.

## Trust

T1 (no dead nav / scaffold copy), T5 (League Bureau depth).
