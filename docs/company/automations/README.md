# Cursor Automations

This folder holds the prompt bodies and configuration specs for every Cursor
Automation that drives the Razzle Company OS.

The Automations live in two places:

| Layer | Where | What it does |
|-------|-------|--------------|
| The trigger + repo + model | `cursor.com/automations` (Cursor dashboard) | Fires when Slack message matches keyword. Pins the repo, base branch, model. |
| The prompt body | `docs/company/automations/<name>.md` (this folder, in the repo) | Versioned. Reviewable. Copy-pasted into the dashboard once and updated by PR thereafter. |

Splitting the prompt out of the dashboard means you get git history on every
prompt change, and the prompts are diffable in PRs.

---

## Automations

| Name | Trigger | Status | Spec |
|------|---------|--------|------|
| Morning Standup | Slack message `good morning team` in `#razzle-team` | **Build now** | `good-morning.md` |
| Closing Log | Slack message `good evening team` in `#razzle-team` | **Build now** | `good-evening.md` |
| Loop Tick | Hourly cron during open workday | DEFERRED — do not enable until Stage 0 → 1 gates met | `tick.md` |

---

## State

The Automations share a single state file: `docs/company/state/workday.json`.

- `Morning Standup` opens the workday (writes `status: open`).
- `Closing Log` closes the workday (writes `status: closed`).
- `Loop Tick` (when enabled) reads the file and skips work if `closed`.

See `docs/company/state/README.md`.

---

## Why this design

1. **Slack-driven, not cron-driven, until the prompt is trusted.** The Founder
   sends two messages a day. No background work fires unless triggered.
2. **One cycle per trigger, until the gates are met.** Per
   `docs/company/AUTOMATION.md` Stage 0 → 1 unlocks, the loop turns on after
   5 clean standups. The loop tick automation is documented and ready to
   enable, but disabled by default.
3. **Prompts in the repo, configs in the dashboard.** Prompts evolve via PRs.
   Triggers, repo pins, and model choices live in Cursor where the credentials
   are.
4. **Two automations that do real work, not five that route to each other.**
   Morning runs the cycle. Evening writes the closing log. The loop is added
   only after evidence justifies it.

---

## Setting up the Automations (one-time, browser)

For each Automation:

1. Go to `cursor.com/automations` → New Automation.
2. **Trigger:**
   - Morning + Evening: Slack → New message in channel → `#razzle-team` →
     keyword filter `good morning team` (or `good evening team`).
   - Tick: Schedule → every 1 hour, only between 9am-9pm in your TZ. (Skip
     this whole automation for now.)
3. **Repository:** `swaggerdagger987/razzle`.
4. **Base branch:** `razzle-v2-redesign`.
5. **Model:** `claude-opus-4-7-thinking-xhigh` (or `gpt-5.5-medium` if you want
   to test cheaper). Both are Max-Mode-capable.
6. **Tools enabled:** Open Pull Request, Send to Slack, Memories.
7. **Permission scope:** Private (bills to you, runs as your GitHub identity).
8. **Prompt body:** copy-paste from the matching `.md` file in this folder.
9. **Test:** trigger the keyword from your laptop first, watch the dashboard
   logs, inspect the PR. Once green, you're done.

---

## Updating prompts later

1. Edit the relevant `.md` in `docs/company/automations/`.
2. Open a PR.
3. Once merged, copy the new prompt body into the Cursor dashboard for that
   Automation.
4. Add a row to `docs/company/memory/chief-of-staff.md` noting why you changed
   it and what you expect to improve.

The prompts are part of the company's source code. Treat them that way.
