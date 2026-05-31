# Evidence — Lab L4 ProUpgradeGate upgrade voice

**Date:** 2026-05-31  
**Slice:** `lab-l4-pro-gate-voice` — Pro gate copy feels like upgrade not error  
**Epic:** Lab L4 — Pro gate upgrade voice (atom 1/3)

## UI verification

| Check | Result | Verdict |
|-------|--------|---------|
| Badge copy | `PRO UNLOCK` (not raw tier error) | PASS |
| CTA copy | `unlock Pro intel` (not "See Pro plans") | PASS |
| Preview label | Agent-voiced hand copy | PASS |
| Subtitle | `screener stays free · this intel is Pro` | PASS |

## Build / tests

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | PASS |
| `grep PRO UNLOCK / unlock Pro intel` | PASS |
| `JWT_SECRET=test pytest apps/api/tests -q` | 52 passed; 4 failed — missing `terminal.db` on VM (env gap, not slice) |

**Reality:** PASS (UI-only slice; build green)
