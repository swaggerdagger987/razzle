# Agent Connective Tissue — Implementation Map

**The hallway:** `docs/v2/HALLWAY.md` + `packages/hallway/`  
**Agent voices:** `packages/agents/registry.ts`  
**Personas (LLM prompts):** `agent-personas/*.md`  
**Design spec:** `docs/plans/2026-03-20-agent-connective-tissue-design.md`

Agents are how the hallway **speaks** — staff with domain expertise, not "AI agents" in marketing. Same six characters in every room. User-facing: film room, intel, staff. See `docs/v2/VOICE.md`.

## The band (all six, always)

| ID | Name | Role | Must appear on |
|----|------|------|----------------|
| `razzle` | Razzle | Chief of Staff | Every surface — voice of the product |
| `dolphin` | Dr. Dolphin | Medical | **Everywhere** — injury columns, Player Sheet Ask default for health, Bureau depth grades |
| `hawkeye` | Hawkeye | Scout | Usage/breakout panels, Self-Scout |
| `bones` | Bones | Diplomat | Trade panels, Trade Network, Pressure Map |
| `octo` | Octo | Quant | Projections, Monte Carlo, Power Rankings |
| `atlas` | Atlas | Historian | Career/history panels, Manager Profiles |

**Dr. Dolphin is non-negotiable.** If a surface shows player data, Dolphin must be reachable (loading copy, Ask picker, or routed specialist).

## Three layers (from design doc)

1. **Personality (free)** — loading/empty copy in agent voice via `loadingCopyForAgent()`
2. **Domain ownership (pro)** — panel groups + Bureau section headers show agent avatar
3. **Alive (pro/elite)** — `/api/agents/ask`, Room orchestration, proactive nudges (later)

## Wiring checklist

| Surface | File(s) | Uses registry? |
|---------|---------|----------------|
| Room roster | `apps/web/components/room/AgentRoster.tsx` | ✅ |
| Room canvas | `packages/pixel-room/` | ✅ six sprites shipped (cycle 49) |
| Player Sheet Ask | `apps/web/components/shell/PlayerSheet.tsx` | ✅ agent picker |
| Lab sidebar | `apps/web/components/lab/LabSidebar.tsx` | ✅ By Staff toggle groups panels by owning agent (cycle 58) |
| Bureau tabs | `apps/web/components/league/*` | ✅ section headers on Bureau-7 |
| Explore loading | `ExplorePageClient.tsx` | TODO — Razzle default OK |
| API orchestrator | `apps/api/services/agents/orchestrator.py` | ✅ all 6 routable |
| API registry mirror | `apps/api/services/agents/registry.py` | ✅ |

## Orchestration flow

```
Question → Razzle routes 1–2 specialists (injury keywords → dolphin first)
         → specialists parallel
         → Razzle synthesizes URGENT|MONITOR|OPPORTUNITY|ROUTINE
```

Direct ask (Player Sheet / Room picker): pass `specialists: [agentId]` to skip routing.

## Do not

- Hardcode 3 agents in UI
- Duplicate agent metadata outside `packages/agents`
- Disable personas in `LAUNCH_AGENTS` — all six ship together
