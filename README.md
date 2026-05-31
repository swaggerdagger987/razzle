# Razzle — Free Fantasy Football Research Lab

A fantasy football research lab at [razzle.lol](https://razzle.lol), disguised as a Sunday comic strip. Bengal-tiger mascot, chunky borders, dynasty intelligence with teeth.

> **Status:** Razzle V2 is in active development on the `razzle-v2-redesign` branch. The V1 code is staged in `legacy/` during the strangler-fig migration. See `docs/v2/STATUS.md` for live status, `docs/company/STAGE.md` for company stage, and `docs/DECISIONS.md` for locked-in architecture calls.

## Quickstart

```bash
# API
cd apps/api
pip install -r requirements-dev.txt
uvicorn main:app --reload --port 8000

# Web (separate terminal)
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Next.js dev server proxies `/api/*` to `http://localhost:8000` (override with `NEXT_PUBLIC_API_ORIGIN`).

## Repo shape

```
razzle/
  apps/
    api/             Python + FastAPI, one router per domain
      routers/       screener, dynasty, analytics, bureau, agents, auth, billing
      services/      data + business logic
      adapters/      nflverse, cfbfastR, sleeper
      models/        Pydantic request/response shapes
      migrations/    Alembic
    web/             Next.js 15 + TypeScript + Tailwind v4
      app/           file-based routes (incl. /lab/[panel] for every Lab panel)
      components/    React primitives
      lib/           API client, hooks
  packages/
    ui/              design tokens + shared primitives (used by apps/web)
    types/           shared Zod schemas + TS types (mirrors apps/api/models)
  data/              terminal.db, users.db (gitignored; production lives on /data)
  docs/              NORTH_STAR, DESIGN, DECISIONS, v2/STATUS — see docs/README.md
  agent-personas/    Markdown system prompts for the six Situation Room agents
  infra/             Dockerfile, fly.toml, render.yaml
  legacy/            V1 frontend/backend, removed at the end of Phase 7
```

## Tech stack

- **Frontend:** Next.js 15 App Router, TypeScript, Tailwind v4, TanStack Query/Table/Virtual, Zod, nuqs for URL state.
- **Backend:** Python 3.12, FastAPI with `APIRouter` per domain, Pydantic v2, slowapi.
- **Database:** SQLite + Alembic. `terminal.db` (stats, ~500MB) + `users.db` (auth/billing, small).
- **Data sources:** nflverse, cfbfastR, Sleeper API, ESPN injury feeds.
- **Auth:** JWT + bcrypt (kept from V1; managed-provider swap is Decisions-doc Phase 3.5).
- **Billing:** Stripe Customer Portal + webhooks. Free + Pro yearly on launch.
- **LLM:** OpenRouter (Elite key included default; BYOK as advanced toggle).
- **Hosting:** Fly.io API + Next.js (separate). Cloudflare in front for CDN + rate limiting.
- **Observability:** Sentry (errors) + PostHog (product analytics).

## Reading order

1. `docs/README.md` — docs index.
2. `docs/NORTH_STAR.md` — the endgame.
3. `docs/DESIGN.md` — visual language and voice.
4. `docs/DECISIONS.md` — V2 architectural calls.
5. `docs/v2/STATUS.md` — live operational status.
6. `docs/v2/PARITY.md` — vertical backlog (what to build next).
7. `docs/v2/ACCEPTANCE.md` — localhost finish-line gates.
8. `docs/company/STAGE.md` — company stage (deep build, no users).
9. `docs/company/OPERATING_SYSTEM.md` — how the company runs.
10. `PRESERVE.md` — what survives from V1.
