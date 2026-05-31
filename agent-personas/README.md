# Agent Personas — In-Product Situation Room

The six markdown files in this folder are LLM system prompts for Razzle's
**in-product Situation Room agents**:

- `razzle.md` — Razzle (Bengal Tiger, Chief of Staff persona for users)
- `medical.md` — Dr. Dolphin (injury and medical analysis)
- `scout.md` — Hawkeye (scouting, prospects, breakouts)
- `diplomat.md` — The Fox (trade negotiation, league dynamics)
- `quant.md` — The Octopus (Monte Carlo, projections, statistics)
- `historian.md` — The Elephant (long-arc trends, league memory)

These prompts are loaded by `apps/api/services/agents/` and shape how the
product talks to paying users.

---

## Two AI systems — do not confuse

| System | Role | Where |
|--------|------|-------|
| **Agent personas (this folder)** | AI staff that ships **inside** Razzle to users | `agent-personas/` + `packages/agents/` + `apps/api/services/agents/` |
| **Company roles** | AI staff that **builds** Razzle | `docs/company/roles/` + `docs/company/memory/` |

Same word "agent." Different jobs. Both systems coexist permanently.
