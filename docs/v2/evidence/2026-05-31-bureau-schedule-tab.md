# Evidence — Bureau Schedule tab

**Atom:** `league-schedule-tab` | **Cycle:** 91 | **Content commit:** ce0cdcb2

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `JWT_SECRET=test pytest apps/api/tests -q` | 51 passed, 5 skipped |

- Unhid `strength-of-schedule` in Bureau nav (`HIDDEN_BUREAU_SLUGS` → waiver only on branch parent)
- `BureauStrengthOfSchedule.tsx` — Octo slate verdict + PPG compare bars + Room hallway link

**Verdict:** PASS (non-OG slice — Gate C N/A)
