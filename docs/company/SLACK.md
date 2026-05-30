# Operating the Razzle team from Slack

This is the **operator cheat sheet**. Read this on your phone before sending
the morning trigger. Bookmark the channel.

**Slack format law:** [SLACK-FORMATS.md](./SLACK-FORMATS.md) — you get **one line
(10–15 words)** per routine ship. Full detail lives in standup PRs, not the channel.

---

## TL;DR

- Channel: `#razzle-team`
- Start the factory: `good morning team` (opens workday + cycle 1)
- Atoms continue via **loop tick** (~60 min) while workday is open
- Brake the factory: `good evening team` (cost, taste, guardrails)
- Ask a role: `Strategist:`, `Architect:`, etc.
- Your job: read **T1 ship lines**; intervene only on **T2 attention** or when you brake

---

## What happens when you say "good morning team"

1. Cursor Automation fires.
2. Agent opens `workday.json` → `status: open`.
3. Runs cycle 1: epic/atom plan → build → merge if gates pass.
4. Posts **one T1 Slack line** (10–15 words) — not a six-role roll call.
5. Loop ticks ship further atoms until you say `good evening team` or a stall rule fires.

Runtime per cycle: ~8–20 minutes.

---

## 24/7 factory

While workday is **open**, scheduled ticks run ~every 60 minutes:

- Pick next atom from `current-epic.json`
- Build, verify, merge
- T1 Slack line per merge

You do **not** need to type anything between atoms.

**Brake:** `good evening team` — closes workday, ticks go silent, T3 digest (≤5 lines).

---

## Talking to roles during the day

| You type | Who answers |
|----------|-------------|
| `Razzle:` or `Chief:` | Chief of Staff |
| `Strategist:` | Product Strategist |
| `Architect:` | Engineering Architect |
| `Builder:` | Builder |
| `Researcher:` | Data Researcher |
| `Reality:` | Reality Checker |
| `Team:` | One recommended action (no roll call) |
| `Board:` | KEEP / DELETE / REFINE review |

Role answers: **≤40 words** default. See SLACK-FORMATS.md.

Role questions do not start build cycles unless you explicitly ask.

---

## What happens when you say "good evening team"

**Factory brake** — not the only time work happens.

1. Closes workday (`workday.json` → closed).
2. Writes full CEO review in `standups/YYYY-MM-DD-review.md`.
3. Posts **T3 digest** (≤5 lines) to Slack.
4. Loop ticks exit silently until next `good morning team`.

Use when: costs high, product needs human touch, model off guardrails, or end of day.

---

## Mobile flow

1. `good morning team` — factory open.
2. Skim T1 lines as they arrive (10–15 words each).
3. Act only on T2 (blocked/stalled) or if direction feels wrong.
4. `good evening team` when you want to pause spend or review deeply.

---

## Things you can say

| You type | What happens |
|----------|--------------|
| `good morning team` | Open factory, cycle 1 |
| `good evening team` | Brake factory, CEO digest |
| `Strategist:` etc. | Role Q&A (≤40 words) |
| `Board:` | KEEP/DELETE/REFINE |

---

## Things to **not** type

- Credentials or API keys in Slack.
- `good morning team` twice same day (overwrites `started_at`).
- Skip PR step or push to main directly.

---

## CEO notification tiers

| Tier | When | You see |
|------|------|---------|
| T1 | Routine merge | 10–15 word outcome line |
| T2 | Blocked / stalled | ≤25 words + action |
| T3 | good evening | ≤5 line digest |
| Silent | Closed workday / lock | Nothing |

Full roll call, trust scores, evidence → standup file + GitHub PR.

---

## Setup

See [automations/README.md](./automations/README.md) and [HARNESS.md](./HARNESS.md).
Four automations: morning, tick (~60 min), ask-team, evening.

See [FACTORY-VISION.md](./FACTORY-VISION.md) for 24/7 + Stage D lights-out BUILD.
