---
id: S3-035
severity: S3
category: cleanup
finding_ref: EDGE-72
confidence: MEDIUM
---

# S3-035: 12 orphaned process/tracking files at repo root

## Root Cause (UPDATED 2026-03-29 — repo scan)

The repo root contains **33+ non-standard files** that are development artifacts:

### Process tracking (12 files):
1. `AGENTS.md`, `BUGFIX-TRACKER.md`, `BUGS.md`, `LOOP-TASKS.md`
2. `PLATFORM-LOOP-TASKS.md`, `REFINER-LOG.md`, `UX-LOOP-TASKS.md`
3. `QA-AUDIT.md`, `ceo-review-log.md`, `designer-insights.md` (230KB)
4. `team-autoresearch.md`, `ROADMAP.md` (duplicate of `docs/ROADMAP.md`)

### Loop automation scripts (8 PowerShell files):
- `run-content-loop.ps1`, `run-design-loop.ps1`, `run-dual-loop.ps1`
- `run-gtm-loop.ps1`, `run-loop.ps1`, `run-sprint.ps1`
- `run-trio-loop.ps1`, `run-twitter-loop.ps1`

### Agent prompt files (13 text files):
- `bugfix-prompt.txt`, `ceo-prompt.txt`, `designer-prompt.txt`
- `functional-prompt.txt`, `gtm-prompt.txt`, `loop-prompt.txt`
- `pm-prompt.txt`, `ship-prompt.txt`, `shipper-prompt.txt`
- `sprint-prompt.txt`, `twitter-analyst-prompt.txt`
- `twitter-creator-prompt.txt`, `twitter-reviewer-prompt.txt`

### Other artifacts:
- `designer-state.json` (106KB), `campaign-plan.md`
- `home-light-mobile.png` (419KB), `razzle-status-update-mar14.md`

These clutter the repo root and create confusion about project structure.
Per CLAUDE.md, only `CLAUDE.md`, `PROGRESS.md`, and `render.yaml` belong at root.

## What to Fix

Move all process files to `docs/process/`:
```
docs/process/agents.md
docs/process/bugfix-tracker.md
docs/process/bugs.md
...
```

Or delete them if they're fully consumed (check each for active references).

## Files to Change

- Move 12 files from repo root to `docs/process/`
- Update any references (CLAUDE.md, PROGRESS.md) that point to these files

## Acceptance Criteria

- [ ] Repo root contains only: CLAUDE.md, PROGRESS.md, README.md, render.yaml, data/, frontend/, backend/, etc.
- [ ] No broken references to moved files
- [ ] TICKETS.md stays at root (active ticket queue)

## Do NOT

- Do not delete PROGRESS.md — it's the active state tracker
- Do not delete CLAUDE.md — it's the project config
- Do not move docs/ROADMAP.md — it's already in the right place
