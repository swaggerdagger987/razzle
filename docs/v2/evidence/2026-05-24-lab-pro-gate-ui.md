## Ticket: A-004
- Route: `/lab/[panel]`
- Before: the generic panel renderer handled API 402 responses with `ProUpgradeGate`, but bespoke direct-fetch panels could still fall through to raw red error text if a tier gate moved around them.
- After: `fetchPanelJson()` centralizes panel fetch behavior and 402 parsing; Prospects, Weekly Heatmap, and Dynasty Dashboard now render `ProUpgradeGate` for upgrade-required responses.
- Verification:
  - `npm run typecheck --workspace=apps/web` — PASS
  - `npm run build --workspace=apps/web` — PASS
- Verdict: PASS
