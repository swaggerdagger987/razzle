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

## Prompt Versioning

Version marker: `docs/company/automations/VERSION.md`

Each automation prompt body should begin with:

`PROMPT_VERSION: 2026-05-28.v2`

Nightly review should report:

- repo prompt version
- dashboard prompt version (operator-provided)
- sync status: in-sync / drift

If drift exists, fix dashboard prompts before the next morning run.

---

## Automations

| Name | Trigger | Status | Spec |
|------|---------|--------|------|
| Morning Standup | Slack message `good morning team` in `#razzle-team` | **Build now** | `good-morning.md` |
| Ask The Team | Slack messages beginning with `Razzle:`, `Strategist:`, `Architect:`, `Builder:`, `Researcher:`, `Reality:`, `Team:`, or `Board:` | **Build now** | `ask-team.md` |
| CEO Nightly Review | Slack message `good evening team` in `#razzle-team` | **Build now** | `good-evening.md` |
| Loop Tick | Scheduled run while workday is open | **Build now** — autonomy default | `tick.md` |

---

## State

The Automations share a single state file: `docs/company/state/workday.json`.

- `Morning Standup` writes open-state into its branch, creates/merges a PR if
  gates pass, and starts the workday.
- `CEO Nightly Review` reads today's open and merged PRs, writes the digest, and
  closes the workday on its own PR branch.
- `Loop Tick` reads the file and skips work if `closed`; if `open`, it runs
  another cycle and merges if gates pass.

Because PRs are the review gate, do not assume base-branch `workday.json` is
perfectly current during the day. Open PRs are the daytime source of truth.

See `docs/company/state/README.md`.

---

## Safety Controls (must exist outside prompts)

Read and enforce `docs/company/GUARDRAILS.md`:

1. Branch protection on `razzle-v2-redesign` with required checks.
2. Repo-wide run lock (open issue titled `company-os-lock`).
3. Prompt sync discipline (repo vs dashboard).
4. Domain drift guard (football depth + hallway evidence).

Prompts can request these controls, but they must be configured in GitHub and
Cursor dashboard to be real. Step-by-step: **`docs/company/HARNESS.md`**.

---

## Why this design

1. **Slack starts and stops the workday.** The Founder sends `good morning team`
   and `good evening team`. Scheduled ticks can work in between.
2. **Autonomy by default.** The team can merge its own PRs when review gates
   pass. Founder review is nightly and exception-based.
3. **Prompts in the repo, configs in the dashboard.** Prompts evolve via PRs.
   Triggers, repo pins, and model choices live in Cursor where the credentials
   are.
4. **Small number of automations that do real work, not a maze.** Morning opens
   the day. Tick keeps building. Ask The Team handles role conversation.
   Evening writes the CEO review.

---

## Setting up the Automations (one-time, browser)

For each Automation:

1. Go to `cursor.com/automations` → New Automation.
2. **Trigger:**
   - Morning: Slack -> New message in channel -> `#razzle-team` ->
     keyword filter `good morning team`.
   - Evening: Slack -> New message in channel -> `#razzle-team` ->
     keyword filter `good evening team`.
   - Ask The Team: Slack -> New message in channel -> `#razzle-team` ->
     keyword / regex filter
     `^(Razzle|Chief|Strategist|Architect|Builder|Researcher|Reality|Team|Board):`.
     If regex is unavailable, create one automation per prefix.
   - Tick: Schedule -> every 60-90 minutes during the hours you want the team
     working. It exits when `workday.json` is closed.
3. **Repository:** `swaggerdagger987/razzle`.
4. **Base branch:** `razzle-v2-redesign`.
5. **Model:**
   - Morning: `claude-opus-4-7-thinking-xhigh` (or `gpt-5.5-medium` if you want
     to test cheaper). Both are Max-Mode-capable.
   - Evening: `claude-4.6-sonnet-medium-thinking` is enough unless the review
     needs a Founder Board.
   - Ask The Team: `claude-4.6-sonnet-medium-thinking`; manually escalate with
     Opus for `Board:` questions if needed.
6. **Tools enabled:** Open Pull Request, Send to Slack, Memories. GitHub/PR
   merge ability should be available so the team can merge PRs that pass gates.
   For Ask The Team, Open Pull Request is only used when the answer writes files.
7. **Permission scope:** Private (bills to you, runs as your GitHub identity).
8. **Prompt body:** copy-paste from the matching `.md` file in this folder.
9. **Test order:** trigger `Team: Are we ready to run a morning cycle?` first
   (no PR expected unless it writes memory), then `good morning team`, then one
   tick run, then `good evening team`. Watch the first day closely, then let it
   run.

---

## Updating prompts later

1. Edit the relevant `.md` in `docs/company/automations/`.
2. Open a PR.
3. Once merged, copy the new prompt body into the Cursor dashboard for that
   Automation.
4. Add a row to `docs/company/memory/chief-of-staff.md` noting why you changed
   it and what you expect to improve.

The prompts are part of the company's source code. Treat them that way.
