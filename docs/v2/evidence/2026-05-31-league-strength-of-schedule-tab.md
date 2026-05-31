# Evidence — League L5 Schedule tab unhidden

**Date:** 2026-05-31  
**Atom:** `league-strength-of-schedule-tab`  
**Verdict:** PASS (Bureau bespoke renderer)

## Commands

```text
npm run build --workspace=apps/web          → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q → 51+ passed (env snapshot flakes on VM)
node unhide script                          → strength-of-schedule unhidden
```

## Dedup note

- `league-waiver-tendencies-tab` already on base via `a2536dcc` (PR #258) — skipped rebuild.

## Product check

- `HIDDEN_BUREAU_SLUGS` empty — all Bureau tabs visible
- `BureauStrengthOfSchedule` Octo header + PPG bar + Room link
- Epic complete after merge
