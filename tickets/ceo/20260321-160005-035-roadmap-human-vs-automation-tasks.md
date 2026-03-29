# CEO-035: Separate Human Tasks from Automation Tasks in Roadmap

**ID**: 20260321-160005-035
**Page**: Process
**Type**: process
**Severity**: P1
**Created**: 2026-03-21 (CEO Review #3)

## Problem

Phase 1 (Twitter Launch, March 16-22) mixed human tasks (account setup, thread writing, screenshot curation) with automation tasks (deploy, Stripe test, mobile check). The ship loop executed the automation tasks perfectly and couldn't execute the human tasks at all. Result: 3 of 6 items undone with the window closing.

## BEFORE

Phase 1 checklist has 6 items, all treated as equal tasks:
- 1-1 Deploy to production (automation)
- 1-2 Stripe test transaction (automation)
- 1-3 Mobile spot check (automation)
- 1-4 Twitter account ready (HUMAN)
- 1-5 Launch thread posted (HUMAN)
- 1-6 20 screenshots ready (HUMAN + automation)

## AFTER

Roadmap phases explicitly tag each task:
- `[AUTO]` — Ship loop can execute autonomously
- `[HUMAN]` — Requires human judgment, creativity, or account access
- `[HYBRID]` — Automation prepares, human reviews/approves

Phase 1 revised:
- 1-1 Deploy to production [AUTO] ✓
- 1-2 Stripe test transaction [HYBRID — auto runs test, human verifies real charge]
- 1-3 Mobile spot check [AUTO] ✓
- 1-4 Twitter account ready [HUMAN — account creation, bio, profile image]
- 1-5 Launch thread posted [HYBRID — auto drafts, human reviews and posts]
- 1-6 20 screenshots ready [HYBRID — auto generates from Lab, human curates best 20]

## Why

- The ship loop is excellent at automation and cannot do human tasks
- Mixing them in the same checklist creates invisible blockers
- Tagging forces honest planning about what the loop can and can't do

## Acceptance Criteria

- [ ] ROADMAP.md Phase 1 tasks tagged with [AUTO], [HUMAN], or [HYBRID]
- [ ] Phase 1 deadline revised to realistic date (original window passed)
- [ ] Future phases tagged the same way
