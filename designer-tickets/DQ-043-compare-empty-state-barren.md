---
id: DQ-043
priority: P2
category: empty-state
page: compare.html
status: open
---

# Compare page empty state — no illustration, no example, no preview

## What's wrong
When visiting compare.html without player IDs (the default state), the page shows:
- One line of Caveat text: "need two player IDs to compare"
- A "Back to Screener" button
- Nothing else. Blank page.

The compare tool is Razzle's most shareable feature (PNG export, radar overlay, stat diff). Its landing state should sell the feature, not show an error message.

## Evidence
- Screenshot: compare.html desktop shows blank page with single text line
- Code verified: compare.js lines 25-29/60-65 render plain text dynamically, no illustration asset

## Fix
Replace the empty state with:
1. A heading: "COMPARE ANY TWO PLAYERS" in display font
2. A visual preview: static example comparison card (e.g., a pre-rendered radar chart image or SVG placeholder)
3. Two search inputs (autocomplete) so users can start a comparison directly from the page
4. The "Back to Screener" button stays as secondary action

The goal: a Reddit user who lands on this page knows exactly what it does and wants to try it.

## Files
- `frontend/compare.html` — empty state container
- `frontend/compare.js` — lines 25-29, 60-65 (dynamic empty state rendering)
