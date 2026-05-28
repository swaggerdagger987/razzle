# Automation: Loop Tick — DEFERRED

> **Status: DEFERRED. Do not enable until Stage 0 → 1 unlock conditions in
> `docs/company/AUTOMATION.md` are met (5 standups in a row produced PRs the
> Founder used unchanged, ≥70% acceptance).**
>
> This file exists so that flipping to looping mode is a 5-minute config
> change, not a redesign.

---

## What this Automation will do (when enabled)

- Fire on a schedule (every 1-2 hours during the workday).
- Read `docs/company/state/workday.json`.
- If `status: closed`, exit silently. Post nothing. Run nothing.
- If `status: open`, check `cycle_count_today`. If it exceeds the day's cap
  (default 6), exit silently.
- Otherwise: run one Standard Company Loop cycle (the same prompt body as
  `good-morning.md`, except it does NOT re-open the workday).
- Increment `cycle_count_today`. Commit. Push. Open a PR. Post Slack summary.

---

## Why it's deferred

Per `docs/company/STAGE.md` and `docs/company/AUTOMATION.md` Stage 0 → 1
unlock conditions, the company's pre-script gates explicitly require:

1. 5 standups in a row produced PRs the Founder used unchanged (≥70%
   acceptance).
2. Memory files contain real entries from manual runs.
3. Three manual standups produced standup files Founder used without
   rewriting.

A continuous loop running with Opus 4.7 against an unverified prompt is a
high-cost, high-rewrite-rate failure mode. We test the prompt one cycle a day
until it earns trust. Then we flip the switch.

---

## Dashboard config (do not enter yet)

| Field | Value |
|-------|-------|
| Trigger | Schedule → every 1 hour, between 9am and 9pm in your TZ |
| Repository | `swaggerdagger987/razzle` |
| Base branch | `razzle-v2-redesign` |
| Model | `claude-opus-4-7-thinking-xhigh` or `gpt-5.5-medium` |
| Tools | Open Pull Request, Send to Slack, Memories |
| Scope | Private |
| Spend limit | **Set a per-run cap** (e.g., $1.00) — without this, a runaway prompt costs real money |

---

## Prompt body (do not copy yet)

> When you do enable this, replace the references in the morning prompt's
> "WORKDAY OPEN" step with the loop-tick versions below. Everything else is
> identical.

```text
You are the Razzle Company OS, running on a loop tick. The Founder did not
manually trigger this run — the workday is open and the cycle cap has not
been hit, so you proceed.

WORKDAY GATE — check before any work:
1. Read docs/company/state/workday.json.
2. If status != "open": exit silently. Post nothing. Do not edit anything.
3. If cycle_count_today >= 6 (or whatever cap is set in workday.json):
   exit silently.
4. Otherwise: continue. The workday stays open. Increment
   cycle_count_today as part of Step 9 below (not Step 1).

(... rest of prompt is identical to good-morning.md from "CYCLE EXECUTION"
onward, with one change: in Step 9, increment cycle_count_today and update
last_cycle_commit. Do NOT modify started_at — that's set by the morning
trigger. Do NOT touch closed_at — that's set by the evening trigger only.)

ADDITIONAL CONSTRAINTS (loop-mode only):
- If the previous cycle ended with NEEDS WORK or BLOCKED on the same slice
  twice in a row: exit. Add a note to today's standup that the loop has
  stalled and is awaiting Founder review. The next morning trigger or
  Founder Board has to resolve it.
- If you cannot pick a clear next slice (no fresh PARITY row, no DEPTH
  ladder rung, no ACCEPTANCE gap): exit silently. Do not invent work. The
  morning trigger will surface this.
- Daily slice cap: 6 cycles per workday by default. Configurable via
  workday.json's "cycle_cap" field if added in the future.
```

---

## When you actually enable this

1. Confirm the four conditions in `docs/company/SLACK.md` "When to flip to
   looping mode."
2. Set a hard spend limit at `cursor.com/dashboard/usage` first.
3. Create the Automation in the dashboard with the schedule trigger.
4. Watch the first three loop ticks live. Do not walk away.
5. After the first looping day finishes cleanly, add a Founder Board note to
   `docs/company/standups/YYYY-MM-DD.md` documenting the transition.
6. Update this file's banner from DEFERRED to ACTIVE.
7. Add a memory entry to `docs/company/memory/chief-of-staff.md`.

---

## When you would disable this again

- Cost overruns ≥ 2x your budget for 2 consecutive days.
- Reality Checker FAIL rate > 50% over a week.
- Three loop-stalled cycles in 5 days.
- A Founder Board decides the loop is producing low-impact work.

Disabling is just toggling the Automation off in the dashboard. The state
file and prompt files stay in place for the next attempt.
