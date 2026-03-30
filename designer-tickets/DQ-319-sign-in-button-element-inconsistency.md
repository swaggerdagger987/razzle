---
id: DQ-319
title: Sign In is a button element on home page but an anchor on all other pages
priority: P3
category: navigation-consistency
page: sitewide
---

## Problem
The Sign In element in the topnav is implemented differently across pages:
- `index.html` (line 636): uses `<button type="button">`
- All other pages (lab.html, league-intel.html, agents.html, pricing.html): use `<a href="#">`

Both call `openAuthModal()` on click. But the element type difference means:
1. Different keyboard behavior (button gets Enter+Space, anchor gets Enter only)
2. Different default styling and focus behavior
3. Inconsistent semantics

Note: This is different from ticket 171 ("sign-in-a-href-hash-not-button-75-pages") which was about converting ALL to button. This ticket notes the INCONSISTENCY between index.html (already button) and the rest (still anchors).

## Expected
All Sign In elements should be the same type — `<button>` is correct per semantics.

## Fix
- 4 files: change Sign In `<a href="#">` to `<button type="button">` in lab.html, league-intel.html, agents.html, pricing.html nav sections

## Files
- `frontend/lab.html`, `frontend/league-intel.html`, `frontend/agents.html`, `frontend/pricing.html` — topnav Sign In element
