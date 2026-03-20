---
id: 20260320-170026-026
severity: P2
confidence: HIGH
flow: global
flow_name: Polish — Position-Colored Top Stripes on Cards
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Add position-colored top stripes on all cards across all pages

**PRIORITY: P2** | **Type: structural**
**Page**: all pages with player cards
**Design doc**: docs/DESIGN.md

Every card that represents a player should have a 4px colored stripe at the top indicating their position: QB=blue (#5b7fff), RB=teal (#2ec4b6), WR=terracotta (#d97757), TE=purple (#8b5cf6). This applies across the Lab screener results, Bureau roster grids, Situation Room player mentions, and any other card that shows a player. The stripe should be implemented as a CSS border-top or pseudo-element for consistency.

### Task 1: Implement position-colored card stripes globally
**Accept when**: Every player card across all pages (Lab screener, Bureau odds grid, Bureau Self-Scout roster, trade suggestions) has a 4px colored top stripe matching the player's position. Colors match DESIGN.md position palette exactly. Cards without a position association (e.g., manager cards) have no stripe. The stripe is implemented via a shared CSS class (e.g., `.card-qb`, `.card-rb`, `.card-wr`, `.card-te`).
