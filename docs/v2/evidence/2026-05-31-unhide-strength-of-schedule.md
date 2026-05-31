# Evidence — Unhide Strength of Schedule

**Date:** 2026-05-31  
**Slice:** `unhide-strength-of-schedule`

## Verification

```bash
npm run build --workspace=apps/web
```

| Check | Result |
|-------|--------|
| Build | PASS |
| `HIDDEN_BUREAU_SLUGS` | Empty — all Bureau tabs visible |

## Code

- `BureauStrengthOfSchedule.tsx` — Octo header, PPG vs avg opponent, verdict, Room link.
- `bureau-features.ts` — removed last hidden slug.
- `BureauFeatureBody.tsx` — wired renderer.

## Verdict

**PASS** — Bureau nav fully unhidden with bespoke bodies.
