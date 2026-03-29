# S2-053: Agent names in code don't match DESIGN.md

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets/DQ-032
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/warroom.js:718-731` — `AGENT_DEFS` uses nicknames ("Bones", "Octo", "Atlas") while DESIGN.md specifies formal names ("The Fox", "The Octopus", "The Elephant").

| Agent ID | Code Name | DESIGN.md Name | Role |
|----------|-----------|----------------|------|
| 0 | Razzle | Razzle | Chief of Staff |
| 1 | Dr. Dolphin | Dr. Dolphin | Medical Analyst |
| 2 | Hawkeye | Hawkeye | Scout |
| 3 | **Bones** | **The Fox** | Diplomat |
| 4 | **Octo** | **The Octopus** | Quant |
| 5 | **Atlas** | **The Elephant** | Historian |

These names also appear in:
- `frontend/agent-config.js` — territory mappings
- `frontend/agents.html` — agent bio cards, canvas sprites
- `frontend/league-intel.html` — loading state text ("bones is reading the room...")

## Fix

**Decision needed**: Either:
1. Update code to match DESIGN.md formal names, OR
2. Update DESIGN.md to match the code's nickname versions

If keeping nicknames, consider showing both: "Bones (The Fox) — Diplomat" in agent bios, with the nickname used in casual contexts (loading states, tooltips).

## Files to Change

- `frontend/warroom.js:725,727,729` — AGENT_DEFS names
- `frontend/agent-config.js` — agent name references
- `frontend/agents.html` — bio cards, display names
- `frontend/league-intel.html` — loading state text
- OR `docs/DESIGN.md` — update to match code

## Accept When

1. Agent names are consistent between code and DESIGN.md
2. All user-facing agent references use the same names
3. Decision documented in PROGRESS.md Decisions Log
