# Vertical Backlog — Depth, Not Breadth

**Legacy = pitstop.** V1 handlers and UX patterns are quarry material. The ceiling is **the most intensive screener, lab, league, and situation room in fantasy football** — see `docs/v2/DEPTH.md`.

Council picks **one vertical slice per cycle** (one pillar + one layer). No horizontal expansion.

Status: `RED` | `YELLOW` | `GREEN`

## Current vertical position (~15% of V1, ~5% of ceiling)

| Pillar | Layer now | Next vertical slice | Status |
|--------|-----------|---------------------|--------|
| **Explore** | L5 | Bureau H2H export or Lab panel OG data rows | GREEN |
| **Lab** | L4 | **L4 — pro-gate polish or formula extraction** | GREEN |
| **League** | L5 | **L5 — hidden Bureau renderers or watermarked export** | GREEN |
| **Room** | L5 | **Explore L2 college polish or GTM export slice** | GREEN |

## Launch 10 — Lab L1 (do these deep, ignore the other 90)

One panel per cycle until each is screenshot-worthy:

| # | Panel slug | Agent owner | Legacy handler | Status |
|---|------------|-------------|----------------|--------|
| 1 | `weekly` | Hawkeye | `fetch_weekly_heatmap` | GREEN |
| 2 | `prospects` | Hawkeye | `fetch_prospect_scores` | GREEN |
| 3 | `dynasty-rankings` (`rankings`) | Octo | `fetch_dynasty_rankings` | GREEN |
| 4 | `trade-values` (`tradevalues`) | Bones | `fetch_trade_value_chart` | GREEN |
| 5 | `breakouts` | Hawkeye | `fetch_breakout_candidates` | GREEN |
| 6 | `gamelog` | Atlas | `fetch_game_log` | GREEN |
| 7 | `efficiency` | Octo | `fetch_efficiency_rankings` | GREEN |
| 8 | `aging-curves` | Octo | `fetch_aging_curves` | GREEN |
| 9 | `buy-sell` | Bones | `fetch_buy_sell_candidates` | GREEN |
| 10 | `dashboard` | Razzle | `fetch_dynasty_dashboard` | GREEN |

Done = table/chart renders, agent header, loading copy, OG card, no 500, curl evidence. L3 formula re-sort shipped on all 10 (cycles 36–42).

## Connective tissue — the hallway (non-negotiable)

Every vertical slice passes `docs/v2/HALLWAY.md` checklist. Code: `@razzle/hallway`.

| ID | Hallway requirement | Status |
|----|---------------------|--------|
| H-01 | Context bar + league on all 4 routes | GREEN |
| H-02 | Player Sheet junction (stats/panels/league/ask) wired with typed links | GREEN |
| H-03 | `build_context_block` + `agentContextPayload` share league + player | GREEN |
| H-04 | Six agents same ids everywhere (`@razzle/agents`) | GREEN |
| H-05 | Dolphin reachable from injury surfaces | GREEN |
| H-06 | Room callbacks reference Lab/Bureau/Intel facts (prompt-level) | GREEN |
| H-07 | Intel snippets on Player Sheet + in agent prompts | GREEN |

## Explicitly deprioritized (horizontal — do not pick)

- Porting all 76 legacy HTML pages — **DEFER indefinitely**
- Twitter, Discord, SEO, paid ads — **see `docs/v2/REDDIT.md` — Reddit only**
- Auth/billing polish before Lab L1 + League L1
- ESPN/Yahoo league support

## Reference

- Vertical strategy: `docs/v2/DEPTH.md`
- Legacy quarry: `legacy/backend/live_data/`, `PRESERVE.md`
- Agents: `docs/v2/AGENTS.md`
