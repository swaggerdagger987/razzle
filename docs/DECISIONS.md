# Razzle V2 — Architectural Decisions

The plan appendix left these calls open. This file locks in pragmatic defaults so V2 can ship. Each entry shows what we chose, the alternatives we weighed, and the cost of reversing the decision later.

The bar for changing one of these: produce a 1-page memo with a concrete reason, route through the dev lead, then update this doc with a dated entry.

---

## Frontend

### Framework: Next.js 15 (App Router) + TypeScript
- **Alternatives:** SvelteKit, Remix / React Router 7, Astro + islands.
- **Why:** Server Components let the OG share-card route render PNGs server-side at near-zero cost. React talent pool is the deepest. App Router's file-based routing + parallel routes + intercepting routes map cleanly to `/lab/[panel]`, the Bureau drawers, and the Situation Room modal pattern.
- **Reversal cost:** Medium. Routes and components are framework-flavored; data layer (`apps/api`) is untouched.

### Styling: Tailwind v4 + design tokens in `packages/ui/tokens.css`
- **Alternatives:** vanilla-extract, CSS Modules + the existing CSS variable system, Panda CSS.
- **Why:** Tokens are already CSS variables (`--ink`, `--orange`, `--pos-qb`, etc.) — Tailwind v4's `@theme` directive consumes them directly. Utility model keeps component files thin and discourages the per-panel CSS sprawl that doomed V1.
- **Reversal cost:** Low — utility classes can be replaced with semantic ones over time.

### Tables / virtualization: TanStack Table v8 + TanStack Virtual
- **Alternatives:** AG Grid (heavy, license cost for some features), custom (V1's choice — see lab.js for why it failed).
- **Why:** Headless. Lets us keep the chunky-border aesthetic and per-column heatmap coloring while delegating row/column virtualization to a battle-tested library. Free.
- **Reversal cost:** Medium — table component swap is contained.

### Data fetching: TanStack Query + URL state via `nuqs`
- **Alternatives:** Plain `fetch` + Zustand, RTK Query, SWR.
- **Why:** Query handles caching, dedup, and stale-while-revalidate. `nuqs` makes URL the source of truth for screener filters/sort/columns — the V1 `saveStateToURL` pattern formalized and type-safe.
- **Reversal cost:** Low.

### Validation: Zod (client) ↔ Pydantic (server) bridged by generated TypeScript types
- **Alternatives:** Valibot (smaller), io-ts (less ergonomic).
- **Why:** Zod is the de facto TanStack/Next.js stack default. Generate TS types from the FastAPI OpenAPI schema so the client never drifts from the server.
- **Reversal cost:** Low.

---

## Backend

### Web framework: FastAPI, one `APIRouter` per domain
- **Routers:** `screener`, `dynasty`, `analytics`, `bureau`, `agents`, `auth`, `billing`. `main.py` mounts them and wires middleware in ~150 lines.
- **Reversal cost:** Low — service layer (was `live_data/`) is framework-agnostic.

### Validation/serialization: Pydantic v2
- **Why:** Already FastAPI's native model layer. Replaces the V1 pattern of `int(season)` + `.get()` + ad hoc parsing scattered across endpoints.
- **Reversal cost:** Low.

### Migrations: Alembic
- **Alternatives:** Plain SQL files + a runner, SQLModel.
- **Why:** Real reversible migrations. Replaces V1's `try: ALTER TABLE ... except: pass` pattern that silently lost columns.
- **Reversal cost:** Medium.

### Cache: HTTP `Cache-Control` + CDN (no app-layer cache)
- **What we delete from V1:** the response-byte cache (`_resp_cache`), the enriched-sort cache (`_enriched_cache`), the per-key `_cached()` decorator with LRU + stampede protection.
- **Why:** Razzle data refreshes weekly during the season and almost-never in the offseason. Cloudflare/Fly edge cache hits 99.9% of traffic for free. The bespoke caches existed because the screener's derived-sort path is slow — we fix that in SQL (Phase 4) instead of caching around it.
- **Escape hatch:** if a single endpoint genuinely needs memoization, use `functools.lru_cache` on a service-layer function. No global cache.
- **Reversal cost:** Low.

### Rate limiting: slowapi
- **Alternatives:** CDN-layer (Cloudflare rules), keep the SQLite table.
- **Why:** Decorator-based per-route. Works in dev without a CDN. CDN rules are a Phase 7 addition for abuse, not the primary defense.
- **Reversal cost:** Low.

### Background work: synchronous + FastAPI `BackgroundTasks` (no worker yet)
- **Why:** The only background jobs at this scale are the weekly nflverse sync (cron) and Stripe webhook reconciliation (we delete this — webhooks are idempotent, retries handle dropped events).
- **Add later:** APScheduler or a real worker (Celery/RQ) when we have multi-step pipelines.

---

## Platform

### Auth: extract `legacy/backend/auth.py`, keep ownership
- **Alternatives:** Clerk, Supabase Auth, Lucia.
- **Why we kept it (for now):** 1,305 lines is mostly correct logic (bcrypt, JWT, Sleeper-ID uniqueness, BYOK encryption). Moving to a managed provider during a rewrite *and* a re-platform is two risky changes; we'd rather do them sequentially.
- **Reversal trigger:** First time we lose a weekend to an auth bug, swap to Clerk.

### Billing UI: Stripe Customer Portal for self-serve, custom webhooks for state
- **What we delete:** the reconciliation loop in `legacy/backend/server.py:_reconciliation_loop()`. Webhook handlers are idempotent; if one drops, the next event reconciles.
- **Pricing collapse:** Free + Pro yearly ($79.99) on launch. EA, Lifetime, Elite are feature-flagged off until product-market fit is real. (Plan says the same.)

### Host: Fly.io
- **Alternatives:** Railway, stay on Render.
- **Why:** Cheaper than Render at this scale. SQLite-on-volume story is first-class (Fly Volumes + LiteFS available if we ever need replication). Faster cold starts.
- **Reversal cost:** Low — `infra/fly.toml` and a Render equivalent live side by side. Same Docker image.

### LLM: OpenRouter (Elite key included as default)
- **Alternatives:** Direct Anthropic, multi-provider with fallback.
- **Why:** One key, all models. Lets the user override per agent in advanced settings (the existing BYOK plumbing in `legacy/backend/server.py`'s `/api/user/api-keys`).
- **Reversal cost:** Low.

### Observability: Sentry (errors) + PostHog (product analytics)
- **What we delete from V1:** the home-rolled `/api/analytics/pageview` endpoint and the `analytics_events` table.
- **Why:** Funnels, retention, session replay, feature flags — all in PostHog for free at our scale.

---

## Product gates (locked in)

| Question | V2 default | Revisit when |
|---|---|---|
| First 10 Lab panels | Dynasty Rankings, Trade Values, Weekly Heatmap, Stat Leaders, Breakouts, Matchups, Consistency, Efficiency, Aging Curves, VORP | After 100 paid users — data tells us which panels actually drive retention |
| First 3 agents | Razzle, Octo, Bones | After Situation Room ships and we see actual usage patterns |
| Launch pricing | Free + Pro $79.99/yr only | After first 100 paid users — add Pro monthly to lower friction |
| ESPN/Yahoo league import | Post-launch | When Sleeper-only traffic plateaus |

---

## Migration mechanics

### Strangler fig, path-routed
- Run V1 and V2 side by side behind a single domain.
- Cut routes one at a time: marketing → screener → bureau → situation room.
- Old `legacy/` Python server runs on a separate Fly app, fronted by the same Cloudflare zone, with path rules sending `/v1/*` and unmigrated panels to it.
- When all routes have V2 owners, delete `legacy/`.

### Database
- `terminal.db` carries forward as-is. Same schema, same path on the persistent disk.
- `users.db` carries forward but Alembic takes over schema management going forward (initial migration is a stamp, not a recreate).

---

## How to override a default

1. Open a 1-page memo in `docs/v2/decisions/` named after the swap (e.g. `2026-06-15-swap-clerk-for-auth.md`).
2. State: the trigger (what bug/cost/constraint forced the rethink), the option chosen, the migration plan, the reversal cost.
3. Get the dev lead's :thumbsup: in the PR.
4. Add a row to the log below with a link to the memo.
5. Implement, then update the inline narrative above so the next reader sees the new default.

## Still open for the team to pick

These are not blocking V2 ship, but should be answered before the first paid user:

- **Domain cutover**: when does `razzle.lol` flip from V1 to V2 — at full panel parity, or behind a feature flag per user from day one? (See `docs/v2/PLAN.md` "next devs do first.")
- **First three Bureau v.5 pickups**: roster-depth player-position lookup, real Monte Carlo distributions, real strength-of-schedule from `/league/{id}/matchups/{week}`. All are one-file changes, ordering is a product call.
- **`!razzle` bot launch subreddit**: the four listed in `apps/api/bots/reddit_bot.py::SUBREDDITS` are educated guesses. Mod relationships in r/DynastyFF may want a quiet beta first.
- **Trial offer**: V2 starts every checkout with a 7-day trial (`apps/api/services/billing.py::create_checkout_session`). Confirm that's the launch posture or switch to no-trial.

## Decisions log

| Date | Decision | Author | Notes |
|---|---|---|---|
| 2026-05-23 | All defaults above | V2 architecture review | Phase 3 kickoff |
