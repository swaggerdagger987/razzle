# Evidence — Lab sidebar Staff Picks by agent

**Date:** 2026-05-31  
**Atom:** `lab-sidebar-staff-picks-by-agent`  
**Verdict:** PASS

## Changes

- `LabSidebar.tsx` — Staff Picks launch-10 panels grouped under Hawkeye / Octo / Bones / Atlas / Razzle headers with agent avatars

## Commands

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 56 passed, 4 failed (screener snapshot — pre-existing on base)
```

## Notes

Screener snapshot failures reproduce on `origin/razzle-v2-redesign` without this diff.
