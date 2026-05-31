# Evidence — lab-pro-gate-profile-teasers

**Date:** 2026-05-31  
**Atom:** `lab-pro-gate-profile-teasers`  
**Verdict:** PASS

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
TestClient GET /api/panels/percentiles  → 402
TestClient GET /api/panels/strengths     → 402
```

## Layer

- Lab L4 — `ProUpgradeGate` uses slug-specific blur rows for profile panels
- Atlas owns percentiles + strengths in `packages/agents/registry.ts`

## Trust

T5 (domain-specific upgrade preview), T6 (screenshot-worthy player intel tease)
