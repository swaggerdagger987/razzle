## Ticket: A-005
- Route: `/league`, cross-route context bar and agent context payload
- Before: Sleeper context was stored only in `sessionStorage`, so the selected league could vanish outside the current browser tab/session.
- After: Sleeper user, league list, and selected league are stored in `localStorage` with `sessionStorage` fallback for current-tab compatibility and storage-disabled safety.
- Verification:
  - `npm run typecheck --workspace=apps/web` — PASS
  - `npm run build --workspace=apps/web` — PASS
- Verdict: PASS
