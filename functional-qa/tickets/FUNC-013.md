# FUNC-013: Stock Watch and Buy/Sell dominated by scrub players — missing minimum thresholds

**Severity**: P2
**Flow**: Stock Watch (no flow), Buy/Sell (flow 70 area)
**Status**: OPEN

## Problem

The Stock Watch (`/api/stock-watch`) and Buy/Sell (`/api/buy-sell-candidates`) panels are dominated by practice squad/depth players in the "rising" and "buy low" sections, while elite producers dominate the "falling" and "sell high" sections. This makes the tools useless for real dynasty decision-making.

## Evidence (production, 2026-03-20)

### Stock Watch WR Rising
| Player | PPG | Games | Stock Score |
|--------|-----|-------|-------------|
| Brandon Powell | 2.01 | 7 | 58 |
| Laviska Shenault Jr. | 2.45 | 6 | 46 |
| Trent Sherfield | 2.79 | 8 | 49 |
| Luke McCaffrey | 2.90 | 12 | 45 |

### Stock Watch WR Falling
| Player | PPG | Games | Stock Score |
|--------|-----|-------|-------------|
| Malik Nabers | 18.24 | 15 | 54 |
| CeeDee Lamb | 17.56 | 15 | 59 |
| Puka Nacua | 18.78 | 11 | 69 |
| Chris Godwin | 19.69 | 7 | 71 |

### Buy/Sell WR Buy Low
| Player | PPG | Games | Grade |
|--------|-----|-------|-------|
| KhaDarel Hodge | 5.35 | 6 | A+ |
| Ashton Dulin | 2.13 | 9 | A+ |
| Trent Sherfield | 2.79 | 8 | A |

### Buy/Sell WR Sell High
| Player | PPG | Games | Grade |
|--------|-----|-------|-------|
| Malik Nabers | 18.24 | 15 | C- |
| CeeDee Lamb | 17.56 | 15 | C |

## Root Cause

Both algorithms compare efficiency/consistency/SOS composite metrics against PPG rank, without minimum thresholds. Players with tiny volume (2-3 touches/game) have artificially high efficiency grades because the per-touch metrics aren't penalized for low volume.

## Suggested Fix

Add minimum thresholds to both endpoints:
- **Minimum games**: >= 8 games (half a season)
- **Minimum PPG**: >= 5.0 (or position-specific: QB >= 10, RB/WR >= 5, TE >= 3)
- OR **Minimum volume**: >= 3 targets+carries per game

The `fetch_stock_watch` and `fetch_buy_sell_candidates` functions in `backend/live_data/analytics.py` need these filters added to their SQL queries or post-processing.

## Not Affected

- Report Cards: Honor Roll correctly shows Jefferson, Chase, St. Brown (algorithm handles this better)
- Breakouts: Reasonably shows Odunze, Legette, Wicks (legitimate candidates)
- Efficiency: Already has some volume guards

## Dynasty Veteran Take

"If your stock watch tells me Brandon Powell is a rising WR and CeeDee Lamb is falling, I'm uninstalling your app. This is the fastest way to lose credibility with the r/DynastyFF crowd."
