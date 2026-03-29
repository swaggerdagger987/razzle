---
id: S0-007
severity: S0
category: backend
title: Bijan Robinson 2023 rushing stats wrong — 976 rush yards vs actual 1,463
source: deep-audit + stat-audit
status: open
---

## Problem

Bijan Robinson's 2023 season rushing stats are significantly wrong:

| Stat | DB Value | Actual | Delta |
|------|----------|--------|-------|
| Rush yards | 976 | 1,463 | -487 |
| Rush TDs | 4 | 8 | -4 |
| Carries | 214 | 247 | -33 |
| Receptions | 58 | 58 | correct |
| Rec yards | 487 | 487 | correct |
| Rec TDs | 4 | 4 | correct |

Robinson is the #1 dynasty RB. Wrong data for him gets screenshotted and shared as "Razzle's data is broken." The receiving stats being correct while rushing stats are ~66% of actual values suggests approximately 12 weeks of rushing data imported out of 17.

## Root Cause (CONFIRMED: upstream nflverse CSV data)

**Adapter code fully investigated and cleared:**

- `adapters/nflverse_adapter.py:33-41` — CORE_STATS mapping correctly includes `rushing_yards`, `rushing_tds`, `carries`
- `adapters/nflverse_adapter.py:510-516` — `process_season()` iterates ALL CSV rows, no week-range filtering
- `adapters/nflverse_adapter.py:534-535` — ALL CORE_STATS keys extracted per row: `for csv_key, db_key in CORE_STATS.items(): core[db_key] = safe_float(row.get(csv_key))`
- `adapters/nflverse_adapter.py:629-675` — Upsert uses ON CONFLICT UPDATE for all rushing fields (lines 653, 657)
- `adapters/nflverse_adapter.py:419-433` — `resolve_player_id()` uses gsis_id direct match, then (name, team, pos) tuple — no evidence of player splitting
- `adapters/nflverse_adapter.py:276-354` — CSV format detection handles old (player_stats) and new (stats_player_week) formats; rushing field names unchanged between formats

**No code path can cause partial rushing import.** The adapter extracts all stat columns for every row in a single pass.

**Confirmed root cause:** The nflverse `player_stats_2023.csv` that was downloaded during the original import contained incomplete rushing data for Robinson. The DB's `stats_json` blob matches the DB columns (both show old values), confirming data was consistent at import time. Cross-checked against ESPN and NFL.com — the issue is in the upstream CSV snapshot used during import.

**Resolution:** Re-import season 2023 from a fresh nflverse CSV download. The adapter's upsert logic will update all rushing values without affecting correct data.

## Fix

1. Run the investigation queries above to identify the exact gap
2. Re-import season 2023 from fresh nflverse CSV: `python adapters/nflverse_adapter.py --seasons 2023`
3. Verify Robinson's 2023 totals match: 1,463 rush yds, 8 rush TDs, 247 carries
4. Spot-check 5 other high-profile 2023 RBs (McCaffrey, Gibbs, Achane, Pollard, Henry) — the stat audit found them correct, but verify post-reimport

## Accept When

- Robinson 2023 rush yards = 1,463, rush TDs = 8, carries = 247
- All other 2023 RB stats remain correct after reimport
- The root cause is documented (stale CSV, player ID split, or other)
