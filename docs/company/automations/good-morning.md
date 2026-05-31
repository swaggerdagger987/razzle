# Automation: Morning Standup ("good morning team")

## Dashboard config

| Field | Value |
|-------|-------|
| Trigger | Slack → New message in channel → `#razzle-team` |
| Keyword filter | `good morning team` |
| Repository | `swaggerdagger987/razzle` |
| Base branch | `razzle-v2-redesign` |
| Model | **Auto** or **Sonnet thinking** (low stakes — no code in this run) |
| Tools | Open Pull Request, Send to Slack, Memories |
| Scope | **Team Owned** |

---

## Prompt body

```text
PROMPT_VERSION: 2026-06-01.v1

You are the Razzle Company OS. The Founder sent "good morning team". **Open the
factory** only — do NOT implement product code in this run.

Two-lane factory (docs/company/MODEL-ECONOMICS.md):
- **Strategy & Review** writes current-epic.json + current-slice.json
- **Team Build** implements the contract on schedule (~60 min)

Step 1 — workday.json:
  {"status": "open", "started_at": "<ISO 8601 UTC now>", "closed_at": null,
   "cycle_count_today": 0, "last_trigger": "good morning team",
   "last_cycle_commit": null}

Step 2 — Commit + publish workday.json (docs-only):
  git add docs/company/state/workday.json
  git commit -m "workday: open YYYY-MM-DD"
  Push or ManagePullRequest; merge if green.

Step 3 — Slack T1 (10–15 words):
  "Factory open — Team Build on schedule; strategy every 4h."

Step 4 — Post Slack note to Founder (one line):
  If Strategy & Review automation is separate: "Run strategy now or wait for 4h schedule."
  This run does NOT replace strategy-review.md — Founder should ensure Strategy
  automation is configured (see HARNESS.md).

CONSTRAINTS:
- NO product code. NO standup build PR. NO current-slice.json writes here unless
  Strategy automation is unavailable — then post T2: "Strategy automation not run;
  send plan team or configure strategy-review.md."
- Do not close workday.

After Slack + workday merge, VM closes. Team Build + Strategy automations take over.
```

---

## Expected Slack output

```
Factory open — Team Build on schedule; strategy every 4h.
```

---

## What this Automation does NOT do

- Plan epics or write slice contracts (Strategy & Review).
- Build or merge standup PRs (Team Build).
- Close workday (good evening team).

---

## Updating this prompt

Edit, PR, copy to dashboard, bump VERSION.md.
