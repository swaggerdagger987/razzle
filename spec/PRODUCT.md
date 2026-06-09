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

### Lab — the panels
**Ceiling:** analytical panels where each is a standalone tool power users screenshot. A research lab, not a catalog of names.

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
**Ceiling:** connect Sleeper once; every manager profiled, every roster simulated, every trade path scored. The moat no stat site can copy.

| Layer | Means |
|-------|-------|
| L0 | Connect → pick league → context bar shows user |
| L1 | Self-Scout: real depth grades, build profile, power rank |
| L2 | Monte Carlo: 10k sims, odds grid, not zeroed stubs |
| L3 | Behavioral profiles (manager archetypes, exploit windows) |
| L4 | Trade finder + trade network + pressure map |
| L5 | Scenario explorer (what-if trade → re-sim instantly) |

### Situation Room
**Ceiling:** six staff who already know your league. Pixel office. Cross-triggers. Razzle verdict with urgency tiers.

| Layer | Means |
|-------|-------|
| L0 | Ask → briefing card with urgency |
| L1 | All 6 staff routable; injury → Dolphin |
| L2 | League + player + roster in every prompt |
| L3 | Pixel canvas: 6 characters, walk/work/select |
| L4 | Cross-staff triggers (Dolphin flag → Hawkeye follow-up) |
| L5 | Proactive nudges on Lab/Bureau surfaces |

**The Room is not done until the pixel canvas ships.** Chat-only is scaffolding.

## Player Sheet — junction requirements

The hub, not a modal. Requirements: land → switch players instantly · shows league ownership when connected · Hawkeye/Dolphin context lines · typed links into Lab panels and Bureau · "ask the staff" entry into the Room. Every room's player click resolves to the same sheet.

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
