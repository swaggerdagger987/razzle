# Razzle Company Docs

This folder defines the AI-native company operating system for Razzle.

Start here when designing roles, meetings, model choices, recursive loops, or
automation around the product build.

The Company OS is **canonical**. The prior `docs/v2/` cofounder system (PROGRAM,
COFOUNDERS, BOARD, loop-prompt-*) is superseded — the ethos has been absorbed
into `OPERATING_SYSTEM.md`.

---

## Read Order

1. `STAGE.md` — Where Razzle is right now (build, no-launch, no-users)
2. `OPERATING_SYSTEM.md` — Company principles, ethos, and reconciliation with v2
3. `ORG_CHART.md` — Current six-role company and future hires
4. `MEETINGS.md` — Meeting cadence, three-equals voting, commit gate
5. `SCORECARDS.md` — How roles are evaluated (3-line daily, full grid monthly)
6. `HIRING_AND_FIRING.md` — How roles are created, rewritten, merged, or retired
7. `SOP.md` — CEO-mode operating procedure and old-loop ethos preserved
8. `GUARDRAILS.md` — Branch protection, run lock, prompt-sync, and founder-only boundaries
9. **`HARNESS.md`** — **One-time factory setup** (GitHub, CI, Cursor Automations, Slack)
10. **`FACTORY-VISION.md`** — 24/7 factory, Stage D lights-out BUILD, North Star compounding
11. **`SLACK-FORMATS.md`** — CEO notification tiers (10–15 word ship lines)
12. `NEXT.md` — First slice candidates so the team has something concrete to bite
13. `AUTOMATION.md` — How to run the company recursively, "Never Automate" rules
14. `SLACK.md` — Operator cheat sheet: how to start, brake, and question the team
15. `automations/README.md` — Cursor Automation specs (good-morning, ask-team, good-evening, tick)

Then read the role file for the role being invoked, plus that role's memory file.

---

## Core Roles

| Role | File | Memory |
|------|------|--------|
| Chief of Staff | `roles/chief-of-staff.md` | `memory/chief-of-staff.md` |
| Product Strategist | `roles/product-strategist.md` | `memory/product-strategist.md` |
| Engineering Architect | `roles/engineering-architect.md` | `memory/engineering-architect.md` |
| Builder | `roles/builder.md` | `memory/builder.md` |
| Data Researcher | `roles/data-researcher.md` | `memory/data-researcher.md` |
| Reality Checker | `roles/reality-checker.md` | `memory/reality-checker.md` |

### Two AI systems — do not confuse

| System | Role | Where |
|--------|------|-------|
| **Company roles (this folder)** | AI staff that **builds** Razzle | `docs/company/roles/` + `docs/company/memory/` |
| **Agent personas** | AI staff that ships **inside** Razzle to users (Razzle, Dolphin, Hawkeye, Fox, Octopus, Elephant) | `agent-personas/` + `packages/agents/` + `apps/api/services/agents/` |

Same word "agent." Different jobs. Both systems coexist permanently. When a
role file references "agents," it means company roles. When the product code
references "agents," it means in-product personas.

---

## Folder Layout

```text
docs/company/
  README.md                  this file
  STAGE.md                   current stage + advancement triggers
  OPERATING_SYSTEM.md        principles, ethos, reconciliation
  ORG_CHART.md               current org + future roles
  MEETINGS.md                meeting cadence + outputs
  SCORECARDS.md              evaluation framework
  HIRING_AND_FIRING.md       role lifecycle
  SOP.md                     CEO-mode operating procedure
  GUARDRAILS.md              branch protection + run lock + prompt sync
  NEXT.md                    current lead slice + backup candidate
  AUTOMATION.md              loop, model routing, never-automate rules
  SLACK.md                   operator cheat sheet (phone-friendly)
  roles/                     per-role contracts
  memory/                    per-role append-only learning logs
  standups/                  daily build standup outputs (YYYY-MM-DD.md)
  automations/               Cursor Automation specs (versioned prompts)
    README.md                index + dashboard setup
    VERSION.md               repo prompt version marker
    good-morning.md          "good morning team" — single cycle
    ask-team.md              role-addressed Slack replies
    good-evening.md          "good evening team" — CEO nightly review
    tick.md                  active scheduled loop while workday is open
  state/                     machine-readable workday state
    README.md                schema + read/write protocol
    workday.json             {status, started_at, closed_at, cycle_count_today}
    current-epic.json        epic + atom queue for 24/7 loop
    current-epic.schema.json
    current-slice.json       per-cycle Builder contract
    current-slice.schema.json
  SLACK-FORMATS.md           CEO Slack notification law
  FACTORY-VISION.md          24/7 factory narrative + Stage D
```

---

## Relationship To Product Docs

Company docs do not replace product truth.

Use these sources in this order:

1. `../NORTH_STAR.md`
2. `../DESIGN.md`
3. `../DECISIONS.md`
4. `../v2/STATUS.md`
5. `../v2/PARITY.md`
6. `../v2/DEPTH.md`
7. `../v2/ACCEPTANCE.md`
8. `./STAGE.md`
9. `./OPERATING_SYSTEM.md`

The company exists to serve the product, not the other way around.

---

## Current Operating Mode

**Stage D — Lights-out BUILD.** See `FACTORY-VISION.md`. Run roles by:

- Sending `good morning team` — opens factory, cycle 1, T1 Slack line.
- **Loop ticks (~60 min)** — further atoms while workday open; T1 per merge.
- `good evening team` — **brake** factory; T3 digest; optional for BUILD to continue overnight.
- Role prefixes for Q&A (≤40 words per SLACK-FORMATS.md).

Autonomy is the default. Passing PRs merge without Founder review between atoms.
Founder brakes when cost, taste, or guardrails require human touch.

If you want to run a role manually outside Slack, use the `Prompt Template`
in `AUTOMATION.md` against the role file and memory file directly.

Do not automate unclear judgment. Automate stable handoffs.
