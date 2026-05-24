## Ticket: A-006
- Route: `/league/[id]` Self-Scout
- Before: missing Sleeper context produced a generic red error and could leave previous Bureau data visible because the no-user path returned before clearing state.
- After: missing Sleeper context clears stale data and renders a chunky "Bureau context missing" card with a Connect Sleeper CTA.
- Verification:
  - `npm run typecheck --workspace=apps/web` — PASS
  - `npm run build --workspace=apps/web` — PASS
- Verdict: PASS
