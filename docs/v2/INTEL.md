# Intel Layer — Context Snippets

**Simple problem, insane amounts of data.** Surface facts like:

- *"IND's offense is 3rd-most RB-friendly by usage (41% of carries to RBs)."*
- *"Ja'Marr Chase: 4-year, $120M total ($30M APY) — active deal."*
- *Breaking contract headline from ESPN RSS.*

Agents, Player Sheet, and Bureau all consume the same snippet engine. Sync first; optimize later.

## Architecture

```
nflverse OTC contracts ──┐
player_week_stats (RB %) ├──► terminal.db intel tables ──► snippets.py ──► /api/intel/*
ESPN RSS (contract news) ┘                                      │
                                                                 ├── agent prompts
                                                                 └── Player Sheet UI
```

| Module | Role |
|--------|------|
| `apps/api/services/intel/sync.py` | Download + compute tables |
| `apps/api/services/intel/snippets.py` | Rank, format, agent-assign snippets |
| `GET /api/intel/player/{id}` | Player Sheet, hallway |
| `GET /api/intel/team/{team}` | Bureau, Explore team context |

## Tables (`terminal.db`)

- **`player_contracts`** — OverTheCap via nflverse `historical_contracts.csv.gz`
- **`team_tendencies`** — computed RB carry share, target share, rush/pass rate, ranks
- **`intel_news`** — ESPN RSS headlines matching contract keywords

## Sync

Runs at end of `python scripts/sync_data.py --quick`:

```bash
python scripts/sync_data.py --quick   # includes intel pass
```

## Snippet shape

```json
{
  "category": "coaching",
  "text": "SF's offense is 2nd-most RB-friendly by usage...",
  "agent_id": "hawkeye",
  "priority": 78,
  "source": "team_tendencies"
}
```

## Agent assignment

| Category | Agent |
|----------|-------|
| coaching / usage | Hawkeye |
| contract / salary | Bones |
| contract_news | Bones |
| injury (future) | Dolphin |

## Next sources (add freely — efficiency later)

- Fresh OTC scrape / rotc updates for 2025–26 signings
- nflverse PBP → OC-level run/pass tendencies when coaches table returns
- **Reddit bot `!razzle confirm`** — debunk/confirm claims in-thread (see `docs/v2/REDDIT.md`)
- Sleeper injury + depth chart deltas

## Hallway

Intel snippets appear on **Player Sheet Stats** and inject into **`build_context_block`** so Room/Lab/Ask callbacks reference the same facts.

See `docs/v2/HALLWAY.md`.
