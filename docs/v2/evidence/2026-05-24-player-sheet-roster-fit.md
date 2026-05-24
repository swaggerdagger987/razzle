## Ticket: B-001
- Route: Player Sheet → League tab
- Before: the League tab showed roster ownership status and a generic context sentence, but not a roster-fit read.
- After: the League tab turns ownership status into a first roster-fit stub: starter, bench depth, trade target, waiver watch, or pending mapping, with a Situation Room handoff carrying player context.
- Verification:
  - `npm run typecheck --workspace=apps/web` — PASS
  - `npm run build --workspace=apps/web` — PASS
- Verdict: PASS
