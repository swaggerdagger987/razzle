# S2-025: Loading text "pulling film..." overused across 42 files

**Severity**: S2 (Minor)
**Category**: design
**Source**: Deep Audit 2026-03-28, finding S2-002

## Problem

DESIGN.md says loading states should have personality, but "pulling film..." is
used in 42+ files with 49+ instances. The personality is lost when every page
uses the same phrase.

## Root Cause

- `frontend/app.js:455` — `RAZZLE_LOADING` array defines loading messages but
  most pages hardcode "pulling film..." in HTML instead of using the randomizer
- 42 files use the exact string "pulling film..." in their HTML templates
  (e.g., `advantage.html:108`, `archetypes.html:293`, `auction.html:356`,
  `cheatsheet.html:268`, `compare.html:347`, `dashboard.html:359`, etc.)

## Fix

Replace hardcoded "pulling film..." in each page's HTML with a page-specific
loading message. Examples:
- efficiency.html: "grading the tape..."
- matchups.html: "scouting next week's opponents..."
- aging.html: "charting father time..."
- consistency.html: "measuring the floor and ceiling..."
- breakouts.html: "hunting the next star..."

Or: use JavaScript to randomize from the `RAZZLE_LOADING` array on page load.

## Scope

- 42 HTML files need unique loading text
- Low complexity per file but high file count
