---
severity: S3
confidence: HIGH
category: refactor
source: bloat-audit-2026-03-29
---

# R5: Extract agents.html inline CSS to external file

## What's Wrong

`frontend/agents.html` is 2,549 lines. Of those, 1,680 lines (66%) are inline CSS inside `<style>` tags. The Lab correctly uses external CSS files. agents.html should follow the same pattern.

## The Fix

1. Extract all `<style>` block contents to `frontend/agents.css`
2. Replace `<style>` blocks with `<link rel="stylesheet" href="agents.css">`
3. Update `scripts/build_dist.py` if it minifies CSS
4. Verify the Situation Room renders correctly in both light and dark mode

## Files to Create

- `frontend/agents.css` (~1,680 lines)

## Files to Modify

- `frontend/agents.html` — Replace style blocks with link
- `scripts/build_dist.py` — Add agents.css to minification

## Acceptance Criteria

- [ ] agents.html is under 1,000 lines
- [ ] agents.css exists with all extracted styles
- [ ] Situation Room page renders identically
- [ ] Pixel canvas still works
- [ ] Dark mode works
- [ ] No console errors

## Estimated Savings

agents.html: 2,549 → ~870 lines (66% reduction)
