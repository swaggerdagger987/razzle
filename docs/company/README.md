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
9. **`HARNESS.md`** — Factory setup (five automations, model picks)
10. **`MODEL-ECONOMICS.md`** — Two-lane factory (Strategy vs Team Build)
11. **`FACTORY-VISION.md`** — 24/7 build narrative
12. `NEXT.md` — Lead slice candidates
13. `AUTOMATION.md` — Never Automate rules
14. `SLACK.md` — Operator cheat sheet (`plan team`, triggers)
15. `automations/README.md` — strategy-review, team-build, good-morning, evening, ask-team

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

**Two-lane factory (Stage B).**

- `good morning team` — open workday
- Strategy & Review — 4h schedule + `plan team` (Sonnet)
- Team Build — 60min schedule (Auto / Composer)
- `good evening team` — brake factory
- Ask Team — role prefixes

See [MODEL-ECONOMICS.md](./MODEL-ECONOMICS.md) and [HARNESS.md](./HARNESS.md).
