# Scripts

## Active

- **`dev_stack.sh`** — kill stale dev servers, boot API + Next.js for local dev
- **`sync_data.py`** — pull nflverse stats into `data/terminal.db`

## Superseded by Cursor Automations

- `company_loop.sh` — was planned as the Company OS runner. **Replaced** by
  Slack-triggered Cursor Automations (`docs/company/automations/`). The
  Founder sends `good morning team` / `good evening team` in Slack; a Cursor
  Cloud Agent runs one cycle of the Standard Company Loop and opens a PR.
  Operator cheat sheet: `docs/company/SLACK.md`. A shell-script fallback may
  still be useful for offline / no-Slack runs, but it is no longer the
  primary runner and is not currently tracked as work-to-do.

## Retired

- `v2_loop.sh` — deprecated cofounder loop runner. Lives at
  `graveyard/v2-cofounder-loop/v2_loop.sh` pending deletion. Do not run.
