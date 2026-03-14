# Monte Carlo League Odds — Design Doc

**Date**: 2026-03-14
**Status**: Approved
**Tier**: Summary cards FREE, deep-dive + scenario explorer PRO

## Overview

A living Vegas-style odds board for the Bureau of Intelligence. Uses Monte Carlo simulation to project championship, playoff, and win probabilities for every manager in a connected Sleeper league. Odds update automatically as new data arrives (draft results, schedule release, weekly scores, roster moves).

## Architecture

### Backend: Projection Distribution Builder

**New endpoint: `POST /api/league/simulate`**

Accepts Sleeper roster data + scoring settings. Returns per-player projection distributions.

**Input:**
```json
{
  "managers": [
    {
      "name": "Manager Name",
      "owner_id": "sleeper_id",
      "roster": ["player_id_1", "player_id_2", ...],
      "wins": 5,
      "losses": 3,
      "schedule_remaining": ["opponent_owner_id_week9", ...]
    }
  ],
  "scoring": { "rec": 1, "pass_td": 4, "bonus_rec_te": 0 },
  "season": 2025,
  "current_week": 8,
  "roster_slots": { "qb": 1, "rb": 2, "wr": 2, "te": 1, "flex": 1 }
}
```

**Output:**
```json
{
  "managers": [
    {
      "name": "Manager Name",
      "owner_id": "sleeper_id",
      "actual_wins": 5,
      "actual_losses": 3,
      "roster": [
        {
          "player_id": "...",
          "name": "Ja'Marr Chase",
          "position": "WR",
          "team": "CIN",
          "mean": 18.4,
          "stddev": 6.2,
          "floor": 5.1,
          "ceiling": 34.8
        }
      ],
      "schedule_remaining": ["opponent_owner_id_week9", ...]
    }
  ],
  "season_week": 8,
  "total_weeks": 14,
  "playoff_teams": 6
}
```

**Distribution computation (`backend/live_data/simulate.py`):**

1. Pull `player_week_stats` for each rostered player (up to 3 seasons)
2. Compute mean, stddev, floor (10th pctl), ceiling (90th pctl) per scoring format
3. Apply time-of-year modifiers:
   - **Offseason**: Prior season(s) only, wide distributions. Age-curve adjustment from aging data.
   - **Post-draft**: Rookies get historical rookie distributions by draft position + position.
   - **In-season**: Blend prior + current season. Weight shifts toward current as weeks accumulate (week 1 = 20%/80%, week 10 = 70%/30%).
   - **Injury**: Injured players zeroed or reduced based on status.
4. Return distributions — no simulation on backend.

### Frontend: Monte Carlo Engine

**New file: `frontend/league-simulate.js`**

Runs 10,000 simulations in-browser using distributions from backend.

**Per simulation:**
1. For each remaining week, sample random score per player using normal distribution (Box-Muller transform, clamped to floor/ceiling)
2. Auto-set optimal lineup per manager (best starters by position slots)
3. Determine matchup winner per week
4. Combine with actual results from weeks already played
5. Determine final standings, playoff seeds, simulate playoff bracket
6. Record championship winner

**Output per manager (aggregated across 10,000 sims):**
- Championship %
- Playoff %
- Projected W-L (mean)
- Median finish position
- Floor / ceiling finish (10th/90th pctl)
- Power score (0-100 composite)

**Performance:** 10,000 sims in <2 seconds. Normal sampling is lightweight — no libraries needed.

**Re-simulation triggers:**
- Page load (auto-run)
- Scenario change (trade/waiver/injury)
- Weekly data refresh

### Box-Muller Transform (5 lines)

```javascript
function sampleNormal(mean, stddev, floor, ceiling) {
  var u1 = Math.random(), u2 = Math.random();
  var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(floor, Math.min(ceiling, mean + z * stddev));
}
```

## UI

### Summary Cards (FREE)

Location: Top of Bureau page, immediately after Sleeper connection. One card per manager, sorted by championship odds descending.

```
+-------------------------------+
|  Manager Name             #1  |
|  -----------------------------+
|  CHAMPIONSHIP    18.4%        |
|  [===========                ]|
|  Playoffs  72%  .  W-L 9-5   |
|  ^ +3.2% this week           |
+-------------------------------+
```

Design:
- Chunky Razzle cards (3px border, 4px offset shadow)
- Championship % in Luckiest Guy, large
- Progress bar: green (>25%), orange (10-25%), red (<10%)
- Delta arrow: green up / red down (in-season only)
- Cards slightly rotated (+/-1deg), sticker aesthetic
- Caveat annotation: "based on 10,000 simulations"
- Mobile: cards stack vertically, top 3 visible, rest behind "Show all managers"

### Deep-Dive Panel (PRO)

Click any summary card to expand. Free users see blurred preview + upgrade CTA.

**Tab 1 — Odds Board:**
Full sortable league table: Manager, Champ %, Playoff %, Proj W-L, Power, Trend sparkline.

**Tab 2 — Distribution Charts:**
For selected manager:
- Histogram: simulated final win totals
- Finish position bar chart: % chance at each standing
- Roster strength breakdown: stacked bar by position group contribution

**Tab 3 — Scenario Explorer:**
Three scenario types, all re-simulate instantly (frontend-only):

- **Trade**: "I give [my player] / I receive [opponent player]" — shows championship % before/after with delta
- **Waiver**: "Add [free agent] / Drop [my player]" — same before/after
- **Injury**: "Remove [player] from [manager]" — league-wide odds impact

**Tab 4 — Odds History:**
Week-by-week line chart, all managers' championship % over the season. Hoverable. Populates in-season only.

## Data Flow

```
Sleeper API                    terminal.db
    |                              |
    +- rosters                     +- player_week_stats (weekly PPG)
    +- scoring_settings            +- player_season_pbp (advanced)
    +- schedule/matchups           +- aging curves, rookie historical
    +- standings (actual W-L)
            |                          |
            +----------+---------------+
                       v
              POST /api/league/simulate
              (backend computes distributions)
                       |
                       v
              { managers: [{ roster: [{ mean, stddev, floor, ceiling }] }] }
                       |
                       v
              Frontend Monte Carlo (10k sims, <2s)
                       |
              +--------+--------+
              v        v        v
         Summary    Deep-Dive   Scenario
         Cards      Panel       Explorer
         (FREE)     (PRO)       (PRO)
```

## Files

| File | Purpose |
|------|---------|
| `backend/live_data/simulate.py` | Projection distribution builder |
| `frontend/league-simulate.js` | Monte Carlo engine + scenario explorer UI |
| `frontend/league-intel.html` | New panels (summary cards + deep-dive) — no new HTML file |

## Storage

- Odds history: `localStorage` keyed by `razzle_odds_{league_id}`
- Weekly snapshots stored client-side for trend chart persistence
- No server-side storage needed

## Dependencies

Zero new libraries. Box-Muller for normal sampling. Charts reuse existing Lab canvas patterns.

## Tier Gating

| Feature | Free | Pro/Elite |
|---------|------|-----------|
| Summary odds cards | Yes | Yes |
| Odds board table | No | Yes |
| Distribution charts | No | Yes |
| Scenario explorer | No | Yes |
| Odds history | No | Yes |

Pro and Elite have identical feature access. Elite difference is BYOK API key inclusion only.

## Season Cycle Behavior

| Phase | Data Available | Projection Quality |
|-------|---------------|-------------------|
| Offseason | Prior season stats, roster composition | Wide distributions, directional only |
| Post-draft | Rookies added, historical rookie comps | Slightly tighter, rookies have high variance |
| Schedule release | Matchup difficulty factored in | Meaningful odds, still high uncertainty |
| Weeks 1-4 | Small current-season sample | Blended prior + current, still wide |
| Weeks 5-10 | Growing sample | Distributions tighten significantly |
| Weeks 11-14 | Near-complete season | High confidence projections |
| Playoffs | Known matchups, full season data | Near-certain projections |
