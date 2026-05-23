# V2 Localhost Acceptance — The Finish Line

The loop runs until **every gate below is green**. No phase advance until the gate passes with screenshot evidence.

## Gate 0 — Stack boots (5 min)

```bash
cd razzle
python3 scripts/sync_data.py --status    # players > 0, size < 100MB
JWT_SECRET=dev .venv-v2/bin/uvicorn apps.api.main:app --reload --port 8000 --app-dir .
npm run dev                               # :3000, NOT ~/Desktop/razzle
curl localhost:8000/api/health            # status ok
```

## Gate 1 — Explore (screener)

| Check | Pass criteria |
|-------|---------------|
| NFL data | `/explore` shows ≥20 NFL players, no "API 500" |
| **College data** | Universe toggle → college rows from `cfb_player_season_stats`, ≥10 players |
| Click player | Player Sheet opens, Stats tab shows season row |
| URL state | Changing sort/filter/toggle updates URL, refresh preserves state |
| Mobile | Card feed renders at 375px width |

## Gate 2 — Lab (panels)

| Check | Pass criteria |
|-------|---------------|
| Index | `/lab` lists 100 panels, categories visible |
| Free panels | `weekly`, `prospects`, `dashboard`, `leaders`, `screener` redirect/load |
| Pro gate | On `free` dev plan, pro panel shows upgrade message (402), not blank |
| Renderers | At least **10 panels** return real table/chart data (not JSON dump) |

## Gate 3 — Bureau (league)

| Check | Pass criteria |
|-------|---------------|
| Connect | Sleeper username → league list → pick league |
| Self-Scout | `/league/[id]` shows depth, build profile, power rank |
| Context | Context bar shows `@user · league name` after connect |
| Features | 7/8 bureau tabs return data (H2H picker OK as stub) |

## Gate 4 — Situation Room (pixel + agents)

| Check | Pass criteria |
|-------|---------------|
| **Pixel canvas** | `/room` shows animated office (agents walk, desks, war table) |
| Chat | Ask question → briefing card with urgency tier |
| Context | With Sleeper connected, briefing references league/team |
| Selection | Click agent → camera follow, roster highlights selection |

> **North star requirement:** Room is NOT done until pixel canvas ships. Chat-only `/room` is scaffolding.

## Gate 5 — Automated

```bash
JWT_SECRET=test-secret .venv-v2/bin/pytest apps/api/tests -q   # all pass or skip (no fail)
npm run build                                                  # exits 0
```

## Evidence format

Each loop iteration attaches to `docs/v2/evidence/YYYY-MM-DD-HHMM-<ticket>.md`:

```markdown
## Ticket: EXPLORE-001
- Route: /explore
- Before: [screenshot path or "broken"]
- After: [screenshot path]
- API: curl output snippet
- Verdict: PASS | FAIL
```
