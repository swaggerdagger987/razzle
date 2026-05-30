# Razzle — Agent Guide

See `CLAUDE.md` for product context and `README.md` for quickstart.

## Cursor Cloud specific instructions

### Product (V2)

Razzle V2 is a monorepo: **Next.js 15** (`apps/web`, port **3000**) + **FastAPI** (`apps/api`, port **8000**). The web app proxies `/api/*` to the API. Primary E2E entry: `http://localhost:3000/explore`.

Legacy V1 lives in `legacy/` and is not the default dev target.

### Prerequisites (one-time on fresh VM)

- **Node ≥ 20**, **npm ≥ 10** (already on Cloud Agent images)
- **Python 3.12** with **`python3.12-venv`** (`sudo apt-get install -y python3.12-venv` if venv creation fails)
- Virtualenv at **`.venv-v2`** (created during setup; not committed)

### Starting the dev stack

From repo root, in **two terminals** (or use `./scripts/dev_stack.sh` after `.venv-v2` exists):

```bash
# Terminal 1 — API
JWT_SECRET=dev ENVIRONMENT=development DEV_PLAN=elite \
  .venv-v2/bin/uvicorn apps.api.main:app --reload --port 8000 --app-dir .

# Terminal 2 — Web
npm run dev
```

`scripts/dev_stack.sh` kills stale processes on :3000/:8000 and starts both, but expects `.venv-v2/bin/uvicorn`.

### Data

`data/terminal.db` is gitignored. For player/screener flows, populate once:

```bash
.venv-v2/bin/python scripts/sync_data.py --quick   # ~20MB, 2024–25 seasons
```

Without this file, the Explore page loads but shows empty/loading states.

### Lint / test / build

| Service | Command | Notes |
|---------|---------|-------|
| API lint | `.venv-v2/bin/ruff check apps/api` | May report pre-existing style issues |
| API tests | `JWT_SECRET=ci-secret ENVIRONMENT=development .venv-v2/bin/pytest apps/api/tests -q` | 55+ pass; dynasty snapshot test can fail after fresh data sync |
| Web typecheck | `npm run typecheck --workspace=apps/web` | Matches CI |
| Web lint | `npm run lint --workspace=apps/web` | Requires ESLint config; `next lint` may prompt interactively on first run |
| Web build | `npm run build --workspace=apps/web` | Production build |

Root shortcuts: `npm run dev`, `npm run test:api`, `npm run lint`, `npm run typecheck`.

### Environment variables (local)

Minimal API env for dev (inline or copy `apps/api/.env.example`):

```
JWT_SECRET=dev
ENVIRONMENT=development
DEV_PLAN=elite          # unlocks pro/elite gates without Stripe
```

Optional: `RAZZLE_LLM_API_KEY` for Situation Room agents; Stripe keys for billing E2E.

### Gotchas

- Run uvicorn from **repo root** with `apps.api.main:app --app-dir .`, or from `apps/api` with `uvicorn main:app`.
- Screener API is `POST /api/screener/query` with `sort_key` / `sort_direction` (not a nested `sort` object).
- `npm install` at repo root installs all workspace packages (`apps/*`, `packages/*`).
- Legacy adapter scripts under `legacy/adapters/` are used by `scripts/sync_data.py`; keep legacy Python deps installed in `.venv-v2`.
