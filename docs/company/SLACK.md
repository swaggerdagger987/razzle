# Operating the Razzle team from Slack

This is the **operator cheat sheet**. Read this on your phone before sending
the morning trigger. Bookmark the channel.

---

## TL;DR

- Channel: `#razzle-team` (or whatever you named it during automation setup)
- Start the workday: `good morning team`
- End the workday: `good evening team`
- That's it. The automation does the rest.

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
   - `git commit` + `git push` + open a PR titled `standup: YYYY-MM-DD`
5. The agent posts a Slack summary with the verdict, slice name, commit SHA,
   and a "View PR" link.

End-to-end runtime: usually 8-20 minutes depending on slice complexity.

You can keep working from your phone. You'll get a Slack DM when the cycle is
done.

---

## What happens when you say "good evening team"

1. Same Slack channel, same trigger pattern.
2. The agent reads `AGENTS.md`, then `docs/company/automations/good-evening.md`.
3. The agent **does not start a new build cycle**. It only:
   - Reads today's standup
   - Writes a `## Closing` section under it (cycles ran, slices shipped, what's
     queued for tomorrow, per-role one-liner)
   - Updates each role's memory file with end-of-day reflection
   - Sets `docs/company/state/workday.json` to `closed`
   - `git commit` + `git push` + open a PR titled `closing log: YYYY-MM-DD`
4. The agent posts a goodnight summary to Slack.

If you forget to say "good evening team," the workday stays open in
`workday.json`. No harm done — tomorrow's "good morning team" notices and
fixes it.

---

## Mobile flow

1. Open Slack, go to `#razzle-team`.
2. Type `good morning team`.
3. Wait. (Open the gym. Make coffee. Read.)
4. You'll get a Slack notification: **"View PR in GitHub"**.
5. Skim the PR diff and the standup file. If it looks right, merge. If not,
   leave a comment in the PR — tomorrow's cycle reads recent PRs.
6. End of day: `good evening team` in the same channel.

That's the whole interface.

---

## Things you can say in addition

| You type | What happens |
|----------|--------------|
| `good morning team` | Start the workday, run one cycle |
| `good evening team` | Close the workday, write closing log |
| `@Cursor in razzle list my agents` | See what's currently running |
| `@Cursor list my agents` | Same, when the channel is already pinned to razzle |
| Plain message in an agent's thread | Adds a follow-up instruction to that running agent (only the agent's owner can do this) |

You should rarely need anything except the two trigger phrases.

---

## Things to **not** type

- Do not paste credentials, API keys, or env vars into Slack. Set them once at
  `cursor.com/dashboard/cloud-agents` → Secrets tab.
- Do not say `good morning team` more than once a day. Each trigger spawns a
  full cycle and a real Opus/Sonnet bill. The team has one cycle in it per day
  until Stage 0 → 1 unlocks.
- Do not ask the agent to push directly to `main` or to skip the PR step. The
  PR is the review gate.

---

## What if something goes wrong

| Symptom | First check |
|---------|-------------|
| No Slack response after 25 minutes | `cursor.com/dashboard/cloud-agents` — is the agent still running, errored, or never started? |
| PR was opened but the standup file is empty / weird | Read the standup. The agent may have correctly written a blocker note. That is a real outcome. |
| Two agents running at once | Cancel one. Concurrent cycles confuse memory writes. |
| The cycle blew the cost budget | Check the spend dashboard. Lower the model in the Automation config (Opus 4.7 → Sonnet 4.6) and re-trigger tomorrow. |
| The agent hallucinated a feature | Reject the PR. Add a memory entry to `docs/company/memory/reality-checker.md` describing the hallucination so tomorrow catches it. |

---

## When to flip to looping mode

The agent runs **one cycle per "good morning"** until all four are true:

1. 5 cycles in a row produced PRs you merged with no rewrites.
2. Each role's memory file has at least 3 substantive entries.
3. Reality Checker has caught at least 2 issues that mattered.
4. You actually want more than one cycle per day.

Then enable the third Automation documented in
`docs/company/automations/tick.md` and the agent will keep cycling between
`good morning team` and `good evening team`.

Until then, single-cycle is the contract.

---

## Setup checklist (one time, in browser)

If you haven't built the Automations yet, see
`docs/company/automations/README.md` for the dashboard config. Two
Automations now, a third one later.
