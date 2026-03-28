---
id: S3-035
severity: S3
category: cleanup
finding_ref: EDGE-72
confidence: MEDIUM
---

# S3-035: 12 orphaned process/tracking files at repo root

## Root Cause

The repo root contains 12 process tracking files that are development artifacts,
not part of the product:

1. `AGENTS.md` — Agent persona references
2. `BUGFIX-TRACKER.md` — Bug fix progress tracking
3. `BUGS.md` — Bug list
4. `LOOP-TASKS.md` — Autonomous loop task tracker
5. `PLATFORM-LOOP-TASKS.md` — Platform loop tasks
6. `REFINER-LOG.md` — UI refiner log
7. `UX-LOOP-TASKS.md` — UX loop tasks
8. `QA-AUDIT.md` — QA audit results
9. `ceo-review-log.md` — CEO review log
10. `designer-insights.md` — Designer insights
11. `team-autoresearch.md` — Team autoresearch results
12. `ROADMAP.md` — Duplicate? (canonical version is `docs/ROADMAP.md`)

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
