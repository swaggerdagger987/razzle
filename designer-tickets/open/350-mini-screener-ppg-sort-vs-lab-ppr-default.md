---
id: DES-350
priority: P2
area: index.html / lab.html
section: data consistency
type: ux / consistency
status: open
---

# Mini-screener default sort (PPG) differs from Lab default (PPR total)

## What's wrong

The home page mini-screener fetches data sorted by PPG (points per game):
```
fetch('/api/players?limit=60&sort=ppg&order=desc')
```

The Lab screener defaults to `fantasy_points_ppr` (season total PPR points):
```
sortKey: "fantasy_points_ppr"
```

These are different metrics. PPG rewards per-game efficiency. PPR total rewards volume + availability. A player with 8 games at 25 PPG ranks high in the mini-screener but might rank lower in the Lab (200 total PPR vs someone with 16 games at 18 PPG = 288 total).

A user sees the mini-screener on the home page, notes who's #1, clicks "Open the full Screener," and sees a DIFFERENT #1 player. This creates a "wait, is this the same data?" moment.

## Where

- `frontend/index.html` line 1018: `fetch('/api/players?limit=60&sort=ppg&order=desc')`
- `frontend/lab.js` line 980: `sortKey: "fantasy_points_ppr"`

## Suggested fix

Change the mini-screener to fetch by the same default as the Lab:
```
fetch('/api/players?limit=60&sort=fantasy_points_ppr&order=desc')
```

And update the mini-screener's `_miniSortKey` from `'ppg'` to match, or keep PPG but add a column header label that makes it clear the mini-screener shows "per game" while the Lab shows "total."

## Why this matters

The mini-screener is the user's first impression of Razzle's data. If it doesn't match the actual product, trust erodes before they even open the Lab.
