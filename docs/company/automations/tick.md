# Automation: Loop Tick — ACTIVE WHEN CONFIGURED

> **Status: ACTIVE WHEN CONFIGURED.** The Founder has chosen autonomy by
> default. Configure this Automation after the morning/evening/ask-team
> automations. The loop should keep working between `good morning team` and
> `good evening team` until the Founder closes the day. **The loop does not
> self-stop on failed slices** — it pivots to the next atom.

---

## What this Automation does

- Fire on a schedule (every 1-2 hours during the workday).
- Read `docs/company/state/workday.json`.
- If `status: closed`, exit silently. Post nothing. Run nothing.
- If `status: open`, run one Standard Company Loop cycle.
- Increment `cycle_count_today`. Commit. **Publish** (push or Cursor PR tool).
  Open a PR. Merge if all review gates pass. Post Slack summary.

---

## Why there is no cap — and no self-stop on failure

The Founder runs a **24/7 factory** until `good evening team`. Do not stop because
an arbitrary cycle count was reached. Do not stop because a slice failed once or
twice. **Pivot and continue.**

Stop **only** when:

- `workday.json` status is `closed` (Founder sent `good evening team`).
- Run lock held by another live run (skip this tick silently).
- **Publish blocked** — cannot push branch AND no PR after autopen poll.
- Required secrets/access are missing (Stripe keys, etc.) — post one-line blocker, then
  **next tick picks a slice that does not need that secret**.

**Never stop because:**

- Reality NEEDS WORK or BLOCKED on a slice (even twice, even five times).
- Same slice failed before — mark it `blocked` in standup, pick **next atom**.
- Chief is unsure — pick smallest RED/YELLOW PARITY row from `docs/v2/PARITY.md`.
- Low-impact churn — Founder Board at cycle 10 adjusts; do not halt the factory.

---

## Dashboard config

| Field | Value |
|-------|-------|
| Trigger | Schedule -> every 60-90 minutes while you want the team working |
| Repository | `swaggerdagger987/razzle` |
| Base branch | `razzle-v2-redesign` |
| Model | `claude-opus-4-7-thinking-xhigh` or `gpt-5.5-medium` |
| Tools | **Open Pull Request**, Send to Slack, Memories |
| Scope | **Team Owned** (recommended — uses org GitHub App for push/PR) |
| Spend limit | Founder-controlled in Cursor subscription. No repo-level cap. |

---

## Prompt body

> Copy the full fence below into the Cursor Automation prompt field. This is
> self-contained — you do not need to merge text from good-morning.md manually.

```text
PROMPT_VERSION: 2026-05-31.v1

You are the Razzle Company OS, running on a **loop tick**. The Founder runs
the factory 24/7 while the workday is open. **Never exit because a slice failed.**
If Reality FAIL, pivot to the next atom and keep going.

Read AGENTS.md and docs/company/automations/good-morning.md in full. Follow
the morning spec for Steps 0, CYCLE EXECUTION (Steps 1-7), commit protocol,
publish protocol, PR/merge, Slack summary, and lock release — with the
loop-tick differences below.

WORKDAY GATE — check before any work:
1. Acquire run lock (`company-os-lock` issue) same as morning automation. If
   lock is held by another live run, exit silently (no Slack post).
2. Read docs/company/state/workday.json.
3. If status != "open": release lock and exit silently.
4. Check whether a Founder Board is due: every 10 cycles or any Chief of Staff
   / Reality Checker trigger. If due, run the Board procedure before picking
   another feature slice.
5. Do NOT re-open the workday. Do NOT modify started_at. Do NOT touch closed_at
   (evening trigger only).

CYCLE EXECUTION: identical to good-morning.md Steps 1-7.

COMMIT + PUBLISH (Step 8): identical to good-morning.md — two local commits,
then publish via (A) git push, (B) poll standup-pr-autopen / wait-for-pr script,
(C) Open Pull Request / ManagePullRequest, or (D) BLOCKED: GITHUB_PUBLISH.

PR + MERGE + FACTORY-DOD (Steps 9–9.5): identical to good-morning.md.

METADATA: in the metadata commit, increment cycle_count_today and set
last_cycle_commit. Do NOT reset started_at.

SLACK SUMMARY: same T1 rule as morning Step 10 — one line on SHIP.
  Prefix: "Loop tick." Never mention 403 or paste PR body. If silent exit, post nothing.

ADDITIONAL CONSTRAINTS (loop-mode only):
- **FAIL → PIVOT, NEVER STOP.** If the last cycle was NEEDS WORK / BLOCKED on
  slice X: log X as blocked in today's standup, close or leave open its PR, and
  pick **next atom** (next PARITY row / epic slice). Run a full new cycle.
  Same slice failed 2+ times? Skip it until tomorrow — still run this tick.
- If you cannot pick a "perfect" slice: pick the **smallest** RED/YELLOW row in
  PARITY.md. Never exit silently for "unclear priority."
- Founder Board every 10 cycles — run it, then **continue** (do not halt).
- No daily slice cap. Continue until `good evening team` or publish blocked.
- Release run lock at end (or when skipping due to lock held / workday closed).
- Never end with only a local commit when publish was possible.
```

---

## When to watch closely

Watch the first day closely. The point is to see whether the autonomy thesis is
right or wrong. Do not pre-emptively add process unless evidence says the loop
needs it.

---

## When you would disable this again

Founder toggles off in dashboard — not agent self-disable:

- Runaway cost / token spend (Founder decision)
- Repeated BLOCKED: GITHUB_PUBLISH (infra broken)
- Founder explicitly disables tick in Cursor dashboard
