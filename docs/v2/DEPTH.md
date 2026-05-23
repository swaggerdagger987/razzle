# Vertical Depth — How We Build

**Legacy Razzle is a pitstop, not the destination.**

V1 proved handlers, data joins, and Reddit-worthy surfaces. We port what works, then **go deeper than V1 ever did**. The goal is the most intensive **screener**, **lab**, **league intelligence**, and **situation room** fantasy football has ever seen — not more pages, not more routes, not horizontal sprawl.

## Rule: depth before breadth — **through the hallway**

Build vertical **and** wire the hallway every cycle. See `docs/v2/HALLWAY.md`.

| Do | Don't |
|----|-------|
| Make one panel best-in-class **with cross-room links** | Ship a deep panel that dead-ends |
| Player Sheet as junction (stats → lab → league → ask) | Silo Explore / Lab / League / Room |
| Wire league context into every layer | Build ESPN/Yahoo before Sleeper is flawless |
| Six agents with real domain depth (Dolphin on injury everywhere) | Six agents as emoji buttons with generic prompts |
| Finish Explore → Player Sheet → Lab panel as one vertical slice | Touch 5 surfaces shallowly in one cycle |

**One vertical slice per cycle — plus hallway wires.** Council picks a pillar + layer, ships it deep, **passes hallway checklist**, evidences it.

```markdown
**Pillar:** Explore | Lab | League | Room
**Layer:** L0–L5
**Vertical slice:** e.g. "Lab L1 — dynasty-rankings end-to-end"
**Hallway wires:** Player Sheet → panel; injury → Dolphin; league context in prompt
**Hallway checklist:** docs/v2/HALLWAY.md (all six checks)
**NOT this cycle:** horizontal items (new routes, auth polish) without hallway
```

Each pillar has layers. Climb **down** one layer at a time until it screenshots on r/DynastyFF.

### 1. Explore — the screener

**Ceiling:** Filter any stat. Build any view. NFL + college + prospects in one universe. Custom formulas. Shareable URL + watermarked export. Faster and denser than DynastyProcess, FFDataPros, or any spreadsheet.

| Layer | What "deepest ever" means |
|-------|---------------------------|
| L0 | Loads ≥20 players, sort/filter, no 500 |
| L1 | 100+ stat columns, position colors, virtualized table |
| L2 | College toggle + combine/prospect bridge |
| L3 | Custom formula builder + saved views |
| L4 | Formula store / community composites |
| L5 | Agent margin notes (Hawkeye usage, Dolphin injury flags on rows) |

**Legacy pitstop:** `legacy/backend/live_data/` screener query, column registry in old `lab.js`.

---

### 2. Lab — the panels

**Ceiling:** 70+ analytical panels where each one is a standalone tool power users screenshot. Not a catalog of names — a research lab.

| Layer | What "deepest ever" means |
|-------|---------------------------|
| L0 | Index lists panels; free panels load real data |
| L1 | **10 launch panels** fully rendered (table/chart, not JSON dump) |
| L2 | **20 panels** with agent-owned headers + domain loading copy |
| L3 | Custom formulas feed panel inputs |
| L4 | Pro gates feel like upgrade, not error |
| L5 | OG card per panel matches in-product export |

**Vertical order (launch 10):** weekly, prospects, dynasty-rankings, trade-values, breakouts, gamelog, efficiency, aging-curves, buy-sell, monte-carlo (league).

**Legacy pitstop:** Port handler from `legacy/backend/live_data/*.py` — one panel per cycle, full depth.

---

### 3. League — Bureau of Intelligence

**Ceiling:** Connect Sleeper once; every manager profiled, every roster simulated, every trade path scored. The moat no stat site can copy.

| Layer | What "deepest ever" means |
|-------|---------------------------|
| L0 | Connect → pick league → context bar shows user |
| L1 | Self-Scout: real depth grades, build profile, power rank |
| L2 | Monte Carlo: 10k sims, odds grid, not zeroed stubs |
| L3 | Behavioral profiles (manager archetypes, exploit windows) |
| L4 | Trade finder + trade network + pressure map |
| L5 | Scenario explorer (what-if trade → re-sim instantly) |

**Legacy pitstop:** `legacy/frontend/league-intel.html`, `fetch_league_trade_values`, behavioral profiling design in marketing journal.

---

### 4. Situation Room

**Ceiling:** Six agents who already know your league. Pixel office. Cross-triggers. Dolphin on every injury question. Razzle verdict with urgency tiers. No ChatGPT copy-paste ever again.

| Layer | What "deepest ever" means |
|-------|---------------------------|
| L0 | Ask → briefing card with urgency |
| L1 | All 6 agents routable; injury → Dolphin |
| L2 | League + player + roster in every prompt |
| L3 | Pixel canvas: 6 characters, walk/work/select |
| L4 | Cross-agent triggers (Dolphin flags → Hawkeye usage follow-up) |
| L5 | Proactive nudges on Lab/Bureau (Elite layer) |

**Legacy pitstop:** `legacy/frontend/agents.html`, `agent-personas/`, pixel reference in CLAUDE.md.

---

## Cycle selection (council uses this)

Each cycle declares:

```markdown
**Pillar:** Explore | Lab | League | Room
**Layer:** L0–L5
**Vertical slice:** e.g. "Lab L1 — dynasty-rankings panel end-to-end"
**Explicitly NOT this cycle:** horizontal items (new routes, new tools hub pages, auth polish)
```

## Connective tissue (agents)

Agents are **vertical glue**, not horizontal features. Dr. Dolphin deep on injury columns and Player Sheet Ask is higher priority than a 77th HTML page. See `docs/v2/AGENTS.md`.

## Intel layer (context snippets)

Facts like *"this coach is RB-friendly"* and *"new contract signed"* flow through one engine — not siloed per room. See `docs/v2/INTEL.md`. Every vertical slice should surface relevant intel and wire it to agents via the hallway.

Prune surfaces that don't earn depth. Never prune mid-vertical — finish the ladder first.
