## Ticket: A-002
- Route: `/explore`
- Before: query failures rendered raw red text; empty result sets rendered an empty table/feed with no recovery path.
- After: Explore shows a chunky branded error card with retry, an explicit empty-database message when no data is present, and a filtered-empty state with a clear-filters action.
- Verification:
  - `npm run typecheck --workspace=apps/web` — PASS
  - `npm run build --workspace=apps/web` — PASS
- Verdict: PASS
