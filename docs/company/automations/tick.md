# Automation: Loop Tick — ACTIVE WHEN CONFIGURED

> **Status: ACTIVE WHEN CONFIGURED.** The Founder has chosen autonomy by
> default. Configure this Automation after the morning/evening/ask-team
> automations. The loop should keep working between `good morning team` and
> `good evening team` until the team closes the day or hits a quality blocker.

---

## What this Automation does

- Fire on a schedule (every 1-2 hours during the workday).
- Read `docs/company/state/workday.json`.
- If `status: closed`, exit silently. Post nothing. Run nothing.
- If `status: open`, run one Standard Company Loop cycle.
- Otherwise: run one Standard Company Loop cycle (the same prompt body as
  `good-morning.md`, except it does NOT re-open the workday).
- Increment `cycle_count_today`. Commit. Push. Open a PR. Merge if all review
  gates pass. Post Slack summary.

---

## Why there is no cap

The Founder is intentionally testing whether a documented, adversarial,
autoresearch-driven team can build Razzle autonomously. Do not stop because an
arbitrary cycle count was reached. Stop only for evidence-based reasons:

- Reality Checker issues NEEDS WORK or BLOCKED twice on the same slice.
- Chief of Staff sees product drift, low-impact churn, or unclear priority.
- A Founder Board is due (every 10 cycles) or triggered.
- Required secrets/access are missing.
- Tests/build are failing in a way the current cycle cannot safely resolve.

---

## Dashboard config

| Field | Value |
|-------|-------|
| Trigger | Schedule -> every 60-90 minutes while you want the team working |
| Repository | `swaggerdagger987/razzle` |
| Base branch | `razzle-v2-redesign` |
| Model | `claude-opus-4-7-thinking-xhigh` or `gpt-5.5-medium` |
| Tools | Open Pull Request, Send to Slack, Memories |
| Scope | Private |
| Spend limit | Founder-controlled in Cursor subscription. No repo-level cap. |

---

## Prompt body

> Replace the references in the morning prompt's
> "WORKDAY OPEN" step with the loop-tick versions below. Everything else is
> identical.

```text
PROMPT_VERSION: 2026-05-28.v2

You are the Razzle Company OS, running on a loop tick. The Founder has chosen
autonomy by default. If the workday is open and no quality blocker is present,
run one Standard Company Loop cycle.

WORKDAY GATE — check before any work:
1. Acquire run lock (`company-os-lock` issue) same as morning automation. If
   lock is held by another live run, exit silently.
2. Read docs/company/state/workday.json.
3. If status != "open": release lock and exit silently.
4. Check whether a Founder Board is due: every 10 cycles or any Chief of Staff
   / Reality Checker trigger. If due, run the Board procedure before picking
   another feature slice.
5. Otherwise: continue. The workday stays open. Increment
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
- No daily slice cap. Continue until `good evening team` closes the day or an
  evidence-based blocker is hit.
- If all gates pass, open and merge the PR autonomously. If gates fail, leave
  the PR open with NEEDS WORK and explain in Slack.
- Release run lock at end (or on controlled early exit).
```

---

## When to watch closely

Watch the first day closely. The point is to see whether the autonomy thesis is
right or wrong. Do not pre-emptively add process unless evidence says the loop
needs it.

---

## When you would disable this again

- Reality Checker FAIL rate > 50% over a week.
- Three loop-stalled cycles in 5 days.
- A Founder Board decides the loop is producing low-impact work.
- The Founder sees a direction they disagree with and calls it out.

Disabling is just toggling the Automation off in the dashboard. The state
file and prompt files stay in place for the next attempt.
