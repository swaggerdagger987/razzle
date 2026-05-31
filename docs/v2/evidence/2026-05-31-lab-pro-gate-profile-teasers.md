# Evidence — Lab L4 profile pro-gate teasers

**Date:** 2026-05-31  
**Atom:** `lab-pro-gate-profile-teasers`  
**Trust:** T5, T6

## Changes

- `panel-upgrade-teaser.ts`: `percentiles` + `strengths` blur rows and upgrade pitches.
- `packages/agents/registry.ts`: Atlas owns `percentiles` + `strengths` lab panels.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests/test_panels.py -q   # 9 passed
```

## API (TestClient, free tier)

- `GET /api/panels/percentiles?player_id=00-0036900` → **402**
- `GET /api/panels/strengths?player_id=00-0036900` → **402**

## Verdict

**PASS** — profile Pro gates show Atlas-specific teaser copy, not generic DEFAULT_ROWS.
