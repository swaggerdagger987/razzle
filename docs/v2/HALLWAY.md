# The Hallway — Connective Tissue

**Vertical depth builds rooms. The hallway keeps them one product.**

Four rooms: **Explore** (screener) · **Lab** (panels) · **League** (Bureau) · **Room** (Situation Room).

If we ship a deep Lab panel but nothing links to League context, Player Sheet, or Room — we built a **silo**. The hallway is non-negotiable on every cycle.

**Code:** `packages/hallway/` — typed routes, context shape, slice checklist  
**Agents:** the hallway's **voice** — same six characters in every room (`packages/agents/`)  
**Design spec:** `docs/plans/2026-03-20-agent-connective-tissue-design.md`

---

## Mental model

```
                    ┌─────────────┐
                    │  Context Bar │  ← league + user everywhere
                    └──────┬──────┘
                           │
    Explore ──── Player Sheet ──── Lab
       │              │              │
       └──────────────┼──────────────┘
                      │
                   League (Bureau)
                      │
                   Situation Room
                      │
              (agents know all of the above)
```

The **Player Sheet** is the central junction — stats, panels, league, ask — not a fourth silo.

---

## What crosses the hallway (always)

| Context | Stored | Visible in |
|---------|--------|------------|
| Sleeper user + league | `localStorage` via `lib/sleeper.ts` | Context bar on every route |
| Open player | URL params + `PlayerSheetProvider` | Explore, Lab, any `?player=` deep link |
| Agent choice | Room roster / Player Sheet Ask | Same `AgentId` in registry |
| Prompt facts | `build_context_block()` | Every `/api/agents/ask` call |

---

## Three stitching patterns (from design doc)

1. **Context carries forward** — Dolphin's injury flag in Explore = same fact in Bureau Self-Scout = same line in Room briefing
2. **Breadcrumb nudges** (Elite later) — one-line agent voice linking rooms: `Bones: 2 managers need WR → Trade Finder`
3. **Situation Room callbacks** — agents reference what user already saw: *"You saw the durability flag in the Lab — I'm escalating."*

---

## Slice checklist (every vertical ship)

Before a slice is done, council confirms in `docs/v2/evidence/`:

| Check | Meaning |
|-------|---------|
| `playerIdentityConsistent` | Click player in this room → same Player Sheet everywhere |
| `leagueContextGlobal` | Connected league shows in context bar on `/explore`, `/lab`, `/league`, `/room` |
| `agentPromptWired` | `agentContextPayload()` + API `build_context_block` get league + player when set |
| `crossRoomLinkPresent` | At least one typed link via `@razzle/hallway` (not a dead-end page) |
| `agentRegistryAligned` | Agent ids/copy from `packages/agents`, not hardcoded one-offs |
| `dolphinReachable` | Medical/injury in this slice → Dolphin loading copy, link, or Ask route |

Use `hallwaySlicePassed()` from `@razzle/hallway`.

---

## Building vertical **through** the hallway

**Wrong:** Ship dynasty-rankings panel in isolation.  
**Right:** Ship dynasty-rankings **and** Player Sheet → panel link, league-aware row if connected, Octo header, Room ask prefill for top player.

Each cycle declares in COUNCIL.md:

```markdown
**Vertical slice:** Lab L1 — dynasty-rankings
**Hallway wires:** Player Sheet panels tab → /lab/dynasty-rankings; injury col → Dolphin; top row → Room ask Octo
**Hallway checklist:** [x] playerIdentity [x] leagueContext [x] crossRoomLink ...
```

---

## Do not

- Build a room feature with zero exit to another room
- Duplicate context logic outside `sleeper.ts`, `agent-context.ts`, `build_context_block`
- Ship vertical depth without updating hallway evidence
- Let Lab, League, and Room feel like three different apps with different agent rosters

---

## Related

- Vertical ladders: `docs/v2/DEPTH.md`
- Backlog: `docs/v2/PARITY.md`
- Agent registry: `docs/v2/AGENTS.md`
- Loop: `docs/v2/CONTINUOUS.md`
