<p align="center">
  <img src="https://razzle.lol/assets/razzle-logo.png" alt="Razzle" width="120" />
</p>

<h1 align="center">Razzle</h1>

<p align="center">
  A fantasy football Bloomberg terminal disguised as a Sunday comic strip.
  <br />
  <a href="https://razzle.lol"><strong>razzle.lol</strong></a>
</p>

---

## What is this

Razzle is a free fantasy football analytics platform — 100+ stat columns, 60+ analytical panels, custom formulas, prospect tools, and dynasty rankings. It looks like a comic strip. It hits like a Bloomberg terminal.

Built for the Reddit power user who screenshots their research at 2am.

## The Lab

The core product. A full-featured data screener covering NFL, college, and prospects.

**Screener** — 100+ sortable, filterable stat columns across passing, rushing, receiving, efficiency, advanced metrics, and dynasty valuations. Heatmap coloring, custom column presets, shareable URLs.

**60+ Analytical Panels** — Trade values, VORP, dynasty rankings, tier lists, breakout candidates, aging curves, consistency rankings, target premium, matchup heatmaps, gamescript analysis, red zone usage, stacks, streaks, and more.

**Custom Formulas** — Build your own weighted stat formulas. Save them. Share them in the Formula Store.

**Visualizations** — Radar charts, scatter plots, trend lines, heatmaps. Compare up to 4 players side-by-side.

**Prospect Tools** — Draft class analytics, athletic tiers, big board, prospect profiles with combine data and NFL comps.

**Dynasty Tools** — Trade analyzer, trade values, watchlist with drag-and-drop tier board, roster grading via Sleeper integration.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML/JS/CSS — no framework, 9k+ lines |
| Backend | Python FastAPI — 133 endpoints, 2k+ lines |
| Database | SQLite — single file, ~500MB, 2M+ stat rows |
| Data | nflverse (NFL), cfbfastR (college), Sleeper API (leagues) |
| Hosting | Render |
| Domain | razzle.lol |

## Design

Comic-strip aesthetic with razor-sharp data underneath.

- **Background**: Anthropic sand `#ede0cf`
- **Accent**: Tiger terracotta `#d97757`
- **Ink**: Espresso brown `#2d1f14`
- **Fonts**: Luckiest Guy (display), Space Mono (data), Caveat (handwritten)
- **Borders**: 3px solid, 4px 4px 0 offset box-shadows
- **Position colors**: QB `#5b7fff` · RB `#2ec4b6` · WR `#d97757` · TE `#8b5cf6`
- **Mascot**: Razzle — a Bengal tiger. Chief of Staff energy. Gigachad Garfield.

## Project Structure

```
razzle/
├── frontend/          # HTML, JS, CSS — browser-runnable
├── backend/           # FastAPI server + data queries
├── adapters/          # Data source adapters (nflverse, cfbfastR)
├── data/              # SQLite database (terminal.db)
├── scripts/           # One-off data scripts
├── tests/             # API smoke tests
├── docs/              # North star, roadmap, design guide
└── render.yaml        # Deploy config
```

## Run Locally

```bash
pip install -r requirements.txt
python -m uvicorn backend.server:app --reload --port 8000
```

Open `http://localhost:8000/lab.html`

## Data

All stats sourced from [nflverse](https://github.com/nflverse) (NFL) and [cfbfastR/sportsdataverse](https://github.com/sportsdataverse) (college). Both MIT licensed.

- **NFL**: 2015-2024 seasons, weekly + season stats, play-by-play derived metrics
- **College**: Season aggregates, conference data, prospect profiles
- **Combine**: Athletic measurables, draft picks, historical classes
- **Derived metrics**: DVS, VORP, trade values, breakout detection, archetypes — our IP

## License

Private repository. All rights reserved.

---

<sub>Data provided by nflverse and sportsdataverse.</sub>
