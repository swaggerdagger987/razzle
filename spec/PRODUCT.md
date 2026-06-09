# Product — Rooms, Depth Ladders, Hallway

**Rule: depth before breadth, through the hallway.** One vertical slice per cycle, wired into the rest of the product. A deep panel that dead-ends is a silo, and silos are VETO.

## Depth ladders (L0–L5 per room)

Climb down one layer at a time until it screenshots on r/DynastyFF. Never prune mid-vertical — finish the ladder first.

### Explore — the screener
**Ceiling:** filter any stat, build any view, NFL + college + prospects in one universe, custom formulas, shareable URL + watermarked export. Faster and denser than any spreadsheet.

| Layer | Means |
|-------|-------|
| L0 | Loads ≥20 players, sort/filter, no 500 |
| L1 | 100+ stat columns, position colors, virtualized table |
| L2 | College toggle + combine/prospect bridge |
| L3 | Custom formula builder (league scoring presets) + saved views |
| L4 | Formula store / community composites |
| L5 | Staff margin notes (Hawkeye usage, Dolphin injury flags on rows) |

### Lab — R&D
**Ceiling:** analytical panels where each is a standalone tool power users screenshot, anchored by the **valuation workbench** — the income approach made manipulatable. Methodology published, every assumption exposed as an input the user can stress-test: production baseline, positional age curve, team situation surplus/deficit, growth rate, league scoring translation. Market price (consensus) shown beside intrinsic value (the user's model); the gap is the trade thesis. A research lab, not a catalog of names.

| Layer | Means |
|-------|-------|
| L0 | Index lists panels; free panels load real data |
| L1 | Launch-10 fully rendered (table/chart, never JSON dump) |
| L2 | 20 panels with staff-owned headers + domain loading copy |
| L3 | Custom formulas feed panel inputs |
| L4 | Pro gates feel like upgrade, not error |
| L5 | OG card per panel matches in-product export |

**Launch-10 (the only copy of this list):**

| Slug | Owner | Shape |
|------|-------|-------|
| `weekly` | Hawkeye | heatmap/table |
| `prospects` | Hawkeye | scatter |
| `dynasty-rankings` | Octo | tier table |
| `trade-values` | Bones | chart |
| `breakouts` | Hawkeye | table |
| `gamelog` | Atlas | timeline |
| `efficiency` | Octo | bar chart |
| `aging-curves` | Octo | line chart |
| `buy-sell` | Bones | cards |
| `vorp` | Octo | tier table |

### Bureau — league intelligence
**Ceiling:** connect Sleeper once; every manager profiled, every roster simulated, every trade path scored. The Bureau is the CIA: it monitors continuously and reports without being asked — what happened in your league, why, and what's coming ("Manager X projects to go heavy on RBs before the deadline"). The moat no stat site can copy.

**The group-chat surface:** the Bureau's flagship artifact is the **weekly Bureau Briefing** — a league-wide, screenshot-native report (power shifts, the week's autopsy, who's panicking, who's hoarding RBs) designed to be dropped into the league group chat. Sleeper's feed does this shallowly; the Briefing does it with teeth. It is the league option's reason to exist: one purchase, twelve readers, every week.

| Layer | Means |
|-------|-------|
| L0 | Connect → pick league → context bar shows user |
| L1 | Self-Scout: real depth grades, build profile, power rank |
| L2 | Monte Carlo: 10k sims, odds grid, not zeroed stubs |
| L3 | Behavioral profiles (manager archetypes, exploit windows) |
| L4 | Trade finder + trade network + pressure map |
| L5 | Scenario explorer (what-if trade → re-sim instantly) |

### Situation Room
**Ceiling:** the room **already knows** before you walk in. Live intel (injury reports, beat-reporter news) is on the floor in real time; Dr. Dolphin pairs each injury with history and a credible recovery timeline; impact is quantified for *your* league (championship probability delta, not generic severity). Six staff, cross-triggers, Razzle verdict with urgency tiers. The pixel office is delight, not the point — ambient awareness is the point.

| Layer | Means |
|-------|-------|
| L0 | Ask → briefing card with urgency |
| L1 | All 6 staff routable; injury → Dolphin |
| L2 | League + player + roster in every prompt |
| L3 | Pixel canvas: 6 characters, walk/work/select |
| L4 | Cross-staff triggers (Dolphin flag → Hawkeye follow-up) |
| L5 | Proactive nudges on Lab/Bureau surfaces |

**The Room is not done until the pixel canvas ships.** Chat-only is scaffolding.

## Player Sheet — the connector (first-class pillar, own ladder)

The hub is the most complete, thought-out surface in the product — **the connector of all rooms**, not a modal. Every room's player click resolves to the same sheet. If a feature doesn't make this sheet better, it's probably a silo.

| Layer | Means |
|-------|-------|
| L0 | Land → switch players instantly; position-colored header; clean at 375px |
| L1 | Full stat history (season + weekly), gamelog, career arc |
| L2 | League context when connected: who owns him, whose roster needs him, your exposure |
| L3 | Valuation summary: intrinsic value (your assumptions, link into the workbench) beside market price — the gap, on every sheet |
| L4 | Staff lines: Dolphin health flag + timeline, Hawkeye usage read; "ask the staff" into the Room; trade-ideation hooks ("3 managers in your league need a TE") |
| L5 | Value watches: aggressive alerts when this player's market moves against your model |

## The hallway — wiring checklist

Context that always crosses rooms: Sleeper user + league (context bar on every route) · open player (URL params) · staff identity (one registry) · prompt facts (one context-block builder).

Every slice that ships a surface passes:

| Check | Meaning |
|-------|---------|
| `playerIdentityConsistent` | Click player anywhere → same Player Sheet |
| `leagueContextGlobal` | Connected league visible in context bar on every room |
| `staffPromptWired` | Ask calls get league + player context when set |
| `crossRoomLinkPresent` | At least one typed link out — no dead ends |
| `staffRegistryAligned` | Staff ids/copy from the one registry, no hardcoded one-offs |
| `dolphinReachable` | Surface shows player health → Dolphin is reachable |

**Wrong:** ship dynasty-rankings in isolation. **Right:** ship dynasty-rankings + Player Sheet link + league-aware row + Octo header + Room ask prefill.

## Free / paid line

1. **Screener (forever free)** — the front door; every screenshot comes from here. No catch, no trial bait.
2. **Lab panels (Pro)** — the depth that converts curiosity.
3. **Bureau (free to connect)** — the hook; summary odds free, deep-dive Pro.
4. **Situation Room (Pro)** — the upgrade; never hero-positioned, earns attention through Screener and Bureau.

## Explicitly deprioritized

V1's 76 HTML pages (never port horizontally) · ESPN/Yahoo import (post-Sleeper-plateau) · non-Reddit channels · Elite tier and monthly pricing (flagged off) · auth/billing polish before there's product worth paying for.
