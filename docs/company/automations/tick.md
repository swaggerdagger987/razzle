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
- Increment `cycle_count_today`. Commit. **Publish** (push or Cursor PR tool).
  Open a PR. Merge if all review gates pass. Post Slack summary.

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
- **Publish blocked** after trying both `git push` and Cursor PR tools.

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
PROMPT_VERSION: 2026-05-30.v1

You are the Razzle Company OS, running on a **loop tick**. The Founder has
chosen autonomy by default. If the workday is open and no quality blocker is
present, run one Standard Company Loop cycle.

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
then publish via (A) git push, (B) Open Pull Request / ManagePullRequest, or
(C) BLOCKED: GITHUB_PUBLISH to Slack with founder checklist link.

PR + MERGE (Step 9): identical to good-morning.md. Required checks: api, web,
web-build. Try gh merge, then gh --auto, then leave open with PR URL.

METADATA: in the metadata commit, increment cycle_count_today and set
last_cycle_commit. Do NOT reset started_at.

SLACK SUMMARY: post the same roll-call format as morning. Prefix first line:
"Loop tick." If you exited silently at the gate, post nothing.

ADDITIONAL CONSTRAINTS (loop-mode only):
- If the previous cycle ended with NEEDS WORK or BLOCKED on the same slice
  twice in a row: exit. Add a note to today's standup that the loop has
  stalled and is awaiting Founder review.
- If you cannot pick a clear next slice: exit silently. Do not invent work.
- No daily slice cap. Continue until `good evening team` or an evidence blocker.
- Release run lock at end (or on controlled early exit).
- Never end with only a local commit when publish was possible via Cursor PR tools.
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
- Repeated BLOCKED: GITHUB_PUBLISH without founder fix.
- A Founder Board decides the loop is producing low-impact work.
- The Founder sees a direction they disagree with and calls it out.

Disabling is just toggling the Automation off in the dashboard. The state
file and prompt files stay in place for the next attempt.
