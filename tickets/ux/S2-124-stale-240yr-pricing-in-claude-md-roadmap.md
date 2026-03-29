---
id: S2-124
severity: S2
confidence: HIGH
category: documentation
source: launch-review-2026-03-14 P0-5, evidence-collector-2026-03-14 #price-mismatch
status: OPEN
---

# Stale $240/yr pricing in CLAUDE.md and ROADMAP.md — contradicts live site and NORTH_STAR.md

## Root Cause

The site pricing was updated from the original $240/yr to $79.99/$149.99/yr (Pro/Elite). NORTH_STAR.md was updated to match. However, CLAUDE.md and ROADMAP.md still reference the old $240/yr price. Autonomous agents reading these docs will have a contradictory mental model of the product's pricing strategy.

**Stale references:**
- `CLAUDE.md:5` — "Monetized later through league-contextualized AI agents at $240/yr."
- `ROADMAP.md:125` — "The experience justifies $240/year."
- `ROADMAP.md:208` — "The Situation Room must justify $240/year."

**Already correct:**
- `docs/NORTH_STAR.md:94-95` — Shows $9.99/$79.99 Pro and $19.99/$149.99 Elite
- `frontend/pricing.html:277,301,539-540` — Shows correct Pro/Elite pricing
- `frontend/index.html`, `frontend/agents.html` — Updated per PROGRESS_ARCHIVE.md line 577

## Fix

1. Update `CLAUDE.md:5` from "$240/yr" to "$79.99/$149.99/yr (Pro/Elite)"
2. Update `ROADMAP.md:125` from "$240/year" to "$149.99/year"
3. Update `ROADMAP.md:208` from "$240/year" to "$149.99/year"

## Files to Change

- `CLAUDE.md:5`
- `ROADMAP.md:125,208`

## Acceptance Criteria

1. `grep -r '\$240' CLAUDE.md ROADMAP.md` returns zero results
2. Pricing in CLAUDE.md matches NORTH_STAR.md and pricing.html
3. No user-facing or agent-facing documentation references $240/yr
