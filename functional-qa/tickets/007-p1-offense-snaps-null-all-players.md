---
id: FUNC-007
severity: P1
flow: 42 (Workload Monitor), 33 (Snap Efficiency), 29 (Breakouts)
status: OPEN
file: adapters/nflverse_adapter.py
function: snap count import
created: 2026-03-20
---

# P1: offense_snaps NULL for all players — snap-based tools broken

## What's broken

The `offense_snaps` and `offense_pct` columns in `player_week_stats` are NULL for every player across all seasons. This means:

1. **Workload Monitor** (`/api/workload-monitor`): `snaps_pg=0.0` and `snap_pct=None` for all 50 players
2. **Snap Efficiency** (`/api/snap-efficiency`): fantasy pts per snap can't be calculated properly
3. **Breakout Candidates** (`/api/breakout-candidates`): `snap_pct=0` for all candidates

## Evidence

```
Saquon Barkley (RB) GP=16 Snaps/g=0.0 Touches/g=23.6 Snap%=None
Jonathan Taylor (RB) GP=14 Snaps/g=0.0 Touches/g=22.9 Snap%=None
Kyren Williams (RB) GP=16 Snaps/g=0.0 Touches/g=21.9 Snap%=None
```

Screener confirms: `offense_snaps=None` for top 5 RBs in 2024.

Lamar Jackson week 1 2024: `offense_snaps: None, offense_pct: None`

## Root cause

The nflverse adapter likely does not import the `offense_snaps` and `offense_pct` fields from the nflverse player_stats CSV. These fields exist in nflverse data (they track offensive snap counts per game) but may not be mapped in the adapter's column mapping.

## Impact

- Workload Monitor is a half-functional tool (touches work, snaps don't)
- Snap efficiency rankings are meaningless without real snap data
- Breakout candidates lose snap% as a signal
- Any analysis that uses snap share is compromised

## Fix

Check `adapters/nflverse_adapter.py` — ensure `offense_snaps` and `offense_pct` are included in the column mapping from nflverse CSV fields to `player_week_stats` table columns. Then re-run the adapter to populate the data.

## Verification

```bash
curl -s -X POST "https://razzle.lol/api/screener/query" -H "Content-Type: application/json" -d '{"season":2024,"position":"RB","limit":3}' | python -c "
import json,sys
data=json.load(sys.stdin)
for p in data.get('items',[]):
    print(p.get('full_name'), 'snaps:', p.get('offense_snaps'))
"
# Should return non-None snap counts
```
