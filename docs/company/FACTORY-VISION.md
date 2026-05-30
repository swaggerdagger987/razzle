# Factory Vision — 24/7 BUILD Toward North Star

This document is the **single narrative** for how Razzle's software factory runs
autonomously: compass → rails → execution → compounding product depth.

Read after [NORTH_STAR.md](../NORTH_STAR.md) and before [HARNESS.md](./HARNESS.md).

---

## The goal

Build Razzle toward — and past — the North Star **without Founder pipeline hygiene**:

- **Compass:** Trust pillars T1–T7, four rooms, Player Sheet hub, 1,000 paid users
- **Execution:** Atoms ship 24/7 while the workday is open; one PR per atom
- **Human:** Founder brakes the factory (`good evening team`) or handles permanently
  Founder-only surfaces (GTM identity, pricing, NORTH_STAR/DESIGN/DECISIONS edits)

Legacy V1 is a **pitstop**, not the ceiling. The factory drains [PARITY.md](../v2/PARITY.md),
climbs [DEPTH.md](../v2/DEPTH.md) L0→L5, and wires [HALLWAY.md](../v2/HALLWAY.md) every slice.

---

## Three layers

```text
Compass     NORTH_STAR, DESIGN, PARITY, DEPTH, HALLWAY, ACCEPTANCE
Rails       Company roles, FACTORY-DOD, MODEL-ECONOMICS, GUARDRAILS
Execution   Slack → Automations → GitHub → merge → results.tsv + memory
```

Artifacts loop back into compass: each merge updates PARITY status, DEPTH layer
evidence, and trust scores in `results.tsv`.

---

## 24/7 runtime

| Trigger | Action |
|---------|--------|
| `good morning team` | Open workday; run cycle 1; seed or resume `current-epic.json` |
| **Loop tick** (~60 min) | While `workday.json` is `open`: plan next atom → build → verify → merge |
| `good evening team` | **Brake** — close workday; CEO digest; ticks go silent |

After atom N merges: update `current-epic.json`, post **T1 Slack** (10–15 words),
wait for next tick. No Founder action required for atom N+1.

**Stall without Founder:** same slice NEEDS WORK twice, publish blocked, epic
`blocked`. Factory posts **T2 Slack** and skips that atom until `good morning team`
or epic pivot.

---

## Stage D — Lights-out BUILD

[SOP.md](./SOP.md) Stage D is the operating target for deep build:

- Workday may stay open **indefinitely** (overnight, weekends) until Founder brakes
- Nightly CEO review is **optional** for BUILD to continue — use when cost, taste,
  or guardrails require human touch
- Slack: [SLACK-FORMATS.md](./SLACK-FORMATS.md) T1 for routine ships; full detail in repo
- Founder Board every 10 cycles: **simulated in VM** for KEEP/REFINE; DELETE → skip
  atom + log, do not block the whole factory

Stage advancement (BUILD → LAUNCH-READY) still needs evidence + Founder notification
(T2 Slack) when exit criteria in [STAGE.md](./STAGE.md) are met.

---

## Surpassing North Star (factory terms)

| Mechanism | How |
|-----------|-----|
| PARITY drain | Strategist autopilot: RED/YELLOW → GREEN; cite row every atom |
| DEPTH climb | Each epic targets one pillar layer; no horizontal sprawl |
| Hallway | Architect contract requires cross-room path; Reality FAIL on silo |
| Trust compound | Log T1–T7 in standup + `results.tsv`; prioritize T1 + T6 for Reddit flywheel |
| Reddit intel | Researcher feeds [REDDIT-INTEL.md](../v2/REDDIT-INTEL.md) → new PARITY rows |
| Beyond V1 | Remove `legacy_bridge` imports as PARITY rows; go deeper than old FDL |

---

## State files

| File | Role |
|------|------|
| [workday.json](./state/workday.json) | Open/closed semaphore for ticks |
| [current-epic.json](./state/current-epic.json) | Epic + atom queue; advance after each merge |
| [current-slice.json](./state/current-slice.json) | This cycle's Builder contract |

PARITY remains the backlog catalog; epic file is the **active sprint**.

---

## Permanent human walls

Never automate ([AUTOMATION.md](./AUTOMATION.md)):

- Posting under Founder's identity on Reddit/Twitter/Discord
- Stripe / pricing changes
- Edits to NORTH_STAR, DESIGN, DECISIONS
- Overriding Reality verdict (except Founder)
- Creating new roles without Founder Board

Everything else in deep BUILD is factory-owned: slice pick, code, test, merge, memory.

---

## Success metrics

- Atoms merge on base without Founder merge clicks
- Epic advances atom 1→2→3 with traceable `current-epic.json`
- Slack skim: <30 seconds to understand a day's ships (T1 lines)
- PARITY rows move RED→GREEN; DEPTH layers climb
- `good evening` stops ticks within one schedule period

---

## Related docs

| Doc | Role |
|-----|------|
| [SLACK-FORMATS.md](./SLACK-FORMATS.md) | CEO notification tiers |
| [FACTORY-DOD.md](./FACTORY-DOD.md) | Publish, merge, preview, Slack gates |
| [MODEL-ECONOMICS.md](./MODEL-ECONOMICS.md) | Token tiers per tick |
| [automations/good-morning.md](./automations/good-morning.md) | Open factory + cycle 1 |
| [automations/tick.md](./automations/tick.md) | Continuous atoms |
| [automations/good-evening.md](./automations/good-evening.md) | Brake + digest |
