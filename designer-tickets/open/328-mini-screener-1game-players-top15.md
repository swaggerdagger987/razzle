---
id: DES-328
priority: P1
area: home page
section: mini-screener preview
type: data quality / first impression
status: open
---

# Mini-screener shows 1-game sample players as top 15 scorers

## What's wrong

The home page mini-screener — the first data any visitor sees — ranks Rashee Rice (3 GP, 21.6 PPG), Jimmy Garoppolo (1 GP, 19.9 PPG), and Joe Milton (1 GP, 19.2 PPG) in the top 15. A single-game 19.2 PPG is not comparable to Lamar Jackson's 17-game 25.3 PPG average.

Any fantasy football player will immediately notice this and question the data quality. This is the home page's only live data showcase — it needs to look credible, not misleading.

## Where

`frontend/index.html` — the mini-screener table in the hero section. The data comes from `/api/players` with no minimum games filter.

## Evidence

Visible in home page screenshot: row 6 Rashee Rice (3 GP), row 12 Jimmy Garoppolo (1 GP), row 15 Joe Milton (1 GP).

## Suggested fix

Add a `min_games=8` parameter to the mini-screener API call (or filter client-side after fetch). The full Screener lets users choose — the home page preview should show credible data by default.

Related: DES-253 (mini-screener-no-season-parameter) covers a different aspect of the same API call.

## Why this matters

This is the first 3 seconds of a first-time visitor's experience. "Why is a 1-game player ranked #12?" kills trust before the user even clicks anything.
