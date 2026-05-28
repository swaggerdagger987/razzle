# Operating the Razzle team from Slack

This is the **operator cheat sheet**. Read this on your phone before sending
the morning trigger. Bookmark the channel.

---

## TL;DR

- Channel: `#razzle-team` (or whatever you named it during automation setup)
- Start the workday: `good morning team`
- Ask a role: `Strategist: ...`, `Architect: ...`, `Builder: ...`,
  `Researcher: ...`, `Reality: ...`, `Team: ...`
- End the workday / get CEO review: `good evening team`
- Your job: review the nightly digest and override only when direction feels wrong.

---

## What happens when you say "good morning team"

1. Cursor Automation fires (Slack-channel-keyword trigger).
2. A cloud agent boots in an isolated VM with your repo checked out at
   `razzle-v2-redesign`.
3. The agent reads `AGENTS.md`, then `docs/company/automations/good-morning.md`.
4. The agent runs **one** full Company OS cycle end-to-end:
   - Outside Reality Briefing (light — 1-3 fresh signals)
   - Memory check
   - Daily Build Standup with three-equals voting
   - Build the slice (or write a `KILL` / blocker note if no good slice exists)
   - Reality Checker verifies with execution evidence
   - Memory + scorecard updates
   - `git commit` + `git push` + open/merge a PR titled `standup: YYYY-MM-DD`
5. The agent posts a team roll call in Slack with the verdict, role-by-role
   readout, evidence, and a "View PR" link.

End-to-end runtime: usually 8-20 minutes depending on slice complexity.

You can keep working from your phone. You'll get a Slack DM when the cycle is
done.

---

## Talking to roles during the day

Use role prefixes in the same Slack channel:

| You type | Who answers |
|----------|-------------|
| `Razzle:` or `Chief:` | Chief of Staff |
| `Strategist:` | Product Strategist |
| `Architect:` | Engineering Architect |
| `Builder:` | Builder |
| `Researcher:` | Data Researcher |
| `Reality:` | Reality Checker |
| `Team:` | All six roles, short readout |
| `Board:` | Lightweight KEEP / DELETE / REFINE review |

Examples:

```text
Strategist: Are we building the right next slice for Lab depth?
```

```text
Reality: Is the latest standup PR actually safe to merge?
```

```text
Team: Are we over-indexing on process instead of shipping?
```

Role questions are conversational. They should not start build cycles unless
you explicitly say so. If an answer changes future behavior, the agent should
write memory or open a small PR.

---

## What happens when you say "good evening team"

1. Same Slack channel, same trigger pattern.
2. The agent reads `AGENTS.md`, then `docs/company/automations/good-evening.md`.
3. The agent **does not start a new build cycle**. It only:
   - Reads today's open and merged Company OS PRs
   - Reads standup files, evidence, memory, and results from those PRs
   - Writes a CEO Nightly Review file
   - Updates each role's memory file with end-of-day reflection
   - Sets `docs/company/state/workday.json` to `closed`
   - `git commit` + `git push` + open a PR titled `nightly review: YYYY-MM-DD`
4. The agent posts a goodnight summary to Slack.

You do **not** need to merge the morning PR before evening. Evening review reads
open PRs. Your nighttime job is to review the digest, then merge, reject, or ask
questions.

---

## Mobile flow

1. Open Slack, go to `#razzle-team`.
2. Type `good morning team`.
3. Wait. (Open the gym. Make coffee. Read.)
4. You'll get a Slack notification: **"View PR in GitHub"**.
5. During the day, ask roles questions if needed: `Reality: ...`, `Builder: ...`.
6. End of day: `good evening team` in the same channel.
7. Read the nightly digest. Override only if you disagree with direction or a
   PR is tagged NEEDS FOUNDER.

That's the whole interface.

---

## Things you can say in addition

| You type | What happens |
|----------|--------------|
| `good morning team` | Start the workday, run one cycle |
| `good evening team` | Write CEO nightly review over today's merged/open PRs |
| `Strategist: ...` | Product Strategist answers |
| `Architect: ...` | Engineering Architect answers |
| `Builder: ...` | Builder answers |
| `Researcher: ...` | Data Researcher answers |
| `Reality: ...` | Reality Checker answers |
| `Team: ...` | All six roles answer briefly |
| `Board: ...` | KEEP / DELETE / REFINE review |
| `@Cursor in razzle list my agents` | See what's currently running |
| `@Cursor list my agents` | Same, when the channel is already pinned to razzle |
| Plain message in an agent's thread | Adds a follow-up instruction to that running agent (only the agent's owner can do this) |

You should mostly use the two trigger phrases plus role prefixes.

---

## Things to **not** type

- Do not paste credentials, API keys, or env vars into Slack. Set them once at
  `cursor.com/dashboard/cloud-agents` → Secrets tab.
- Do not say `good morning team` more than once a day. Morning opens the
  workday; scheduled ticks keep working after that.
- Do not ask the agent to push directly to `main` or to skip the PR step. The
  PR is the review gate.

---

## What if something goes wrong

| Symptom | First check |
|---------|-------------|
| No Slack response after 25 minutes | `cursor.com/dashboard/cloud-agents` — is the agent still running, errored, or never started? |
| PR was opened but the standup file is empty / weird | Ask `Reality: Review today's standup PR. Is this a blocker or hallucination?` |
| Two agents running at once | Cancel one. Concurrent cycles confuse memory writes. |
| The cycle got expensive | Check the spend dashboard. Founder controls Cursor cost directly; the repo does not enforce a cap. |
| The agent hallucinated a feature | Reject the PR. Add a memory entry to `docs/company/memory/reality-checker.md` describing the hallucination so tomorrow catches it. |

---

## Looping mode

The tick automation is now part of the setup. It keeps cycling between
`good morning team` and `good evening team` while `workday.json` is open.

The team stops itself only for evidence-based reasons: repeated NEEDS WORK,
missing access, Founder-only decisions, product drift, or Founder Board.

---

## CEO night-review contract

At night, you should receive one digest answering:

1. What shipped?
2. Which PRs merged autonomously?
3. Which PRs are still open and why?
4. What did Reality Checker block?
5. What should the team try tomorrow?

If the digest does not answer those five, ask:

```text
Chief: Rewrite tonight's review as a CEO action list. I only want merge /
reject / ask decisions.
```

---

## Setup checklist (one time, in browser)

If you haven't built the Automations yet, see
`docs/company/automations/README.md` for the dashboard config. Four
Automations now: `good morning`, `ask team`, `tick`, and `good evening`.

Before turning autonomous merge on, configure `docs/company/GUARDRAILS.md`
in GitHub/Cursor dashboard (branch protection + run lock + prompt sync).
