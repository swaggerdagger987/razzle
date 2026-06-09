# Razzle HQ

Razzle is a **fantasy football film room disguised as a Sunday comic strip** — razzle.lol. This repo is the product and the factory that builds it.

## Where truth lives

| Question | File |
|----------|------|
| What are we building? | `spec/NORTH_STAR.md` |
| How does work happen? | `CLAUDE.md` + `factory/` |
| What's active / next / done? | `factory/STATE.md` |
| Design language | `spec/DESIGN.md` + `packages/ui/tokens.css` |
| Locked stack | `spec/STACK.md` |

## Run

```bash
uv sync --all-packages && pnpm install   # setup
scripts/dev.sh                           # API :8000 + web :3000
uv run pytest -q                         # tests
pnpm --filter web build                  # web build
```

## Layout

```
spec/        product truth (7 files — adding one means deleting one)
factory/     slice contract, gates, model routing, state
apps/api/    FastAPI — pure domain spine: LeagueConfig → ScoringEngine → ValuationEngine
apps/web/    Next.js 15 + Tailwind v4
packages/ui/ design tokens (the only design source of truth)
personas/    the six in-product Situation Room staff prompts
data/        razzle.db (gitignored; Alembic owns the schema)
```

Lineage: distilled from `swaggerdagger987/razzle` (vision, design, personas) and `swaggerdagger987/razzle-legacy` (domain spine). Both are read-only reference — this repo never imports from them.
