---
severity: S2
confidence: HIGH
category: refactor
source: bloat-audit-2026-03-29
---

# R3: Extract league-intel.html inline JS and CSS to external files

## What's Wrong

`frontend/league-intel.html` is 8,665 lines. Of those:
- 5,250 lines are inline JavaScript (an entire Bureau of Intelligence app)
- 2,717 lines are inline CSS
- 226 lines are actual HTML markup

This is the largest file in the codebase. The Lab (lab.html) correctly uses external files (lab.js, lab.css). league-intel should follow the same pattern.

## The Fix

### Step 1: Extract CSS (2,717 lines)

1. Find the `<style>` block(s) in league-intel.html
2. Copy all CSS into a new file: `frontend/league-intel.css`
3. Replace the `<style>` block with: `<link rel="stylesheet" href="league-intel.css">`
4. Verify the page renders correctly

### Step 2: Extract JS (5,250 lines)

1. Find the large `<script>` block(s) in league-intel.html
2. Copy all JS into a new file: `frontend/league-intel.js`
3. Replace the `<script>` block with: `<script src="league-intel.js"></script>`
4. Verify: check that any variables/functions used in inline HTML event handlers (onclick, etc.) are still accessible from the external script
5. If there are small inline scripts that reference page-specific DOM elements, those can stay inline — only extract the large blocks

### Step 3: Update build_dist.py

Check `scripts/build_dist.py` — if it minifies JS/CSS files, add `league-intel.js` and `league-intel.css` to the minification list.

### Step 4: Update render.yaml CSP

If the Content-Security-Policy in `backend/server.py` references specific script sources, the external file should work with `'self'` already. But verify.

## Files to Create

- `frontend/league-intel.js` (~5,250 lines extracted from HTML)
- `frontend/league-intel.css` (~2,717 lines extracted from HTML)

## Files to Modify

- `frontend/league-intel.html` — Replace inline blocks with external references
- `scripts/build_dist.py` — Add new files to minification (if applicable)

## Acceptance Criteria

- [ ] league-intel.html is under 1,000 lines
- [ ] league-intel.js exists and contains all extracted JavaScript
- [ ] league-intel.css exists and contains all extracted CSS
- [ ] Bureau of Intelligence page loads and functions identically
- [ ] Sleeper connection flow works (enter username → select league → view odds cards)
- [ ] Dark mode works on the page
- [ ] No console errors when loading the page
- [ ] `scripts/build_dist.py` includes the new files

## Estimated Savings

league-intel.html: 8,665 → ~700 lines (**92% reduction in that file**)
Net new files add ~8,000 lines but they're properly organized.
