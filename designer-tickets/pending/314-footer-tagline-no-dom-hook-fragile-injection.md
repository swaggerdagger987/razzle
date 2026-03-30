---
id: DES-314
title: Footer tagline injection uses fragile text search — no DOM hook on any page
priority: P2
page: app.js + all 75 pages
category: Code Quality / Robustness
cycle: 28
---

## Problem

app.js:1775 tries to inject a randomized footer tagline by looking for `.footer-tagline` or `[data-tagline]`. Neither class nor attribute exists on any of the 75 HTML pages. Zero matches.

The code falls through to a fragile fallback (line 1776-1787) that searches ALL `<div>` and `<p>` elements inside `.site-footer` for text containing "razzle" or "Razzle", then inserts a new div after the first match.

This means:
1. The tagline placement depends on which element happens to mention "Razzle" first
2. If footer text changes, taglines could appear in the wrong location or not at all
3. The injected div uses inline styles (`font-size:14px` Caveat — below 18px minimum per DES-237)

## Where

- `frontend/app.js` line 1775: selector `.footer-tagline, [data-tagline]` — zero matches sitewide
- `frontend/app.js` lines 1776-1787: fallback text search injection
- All 75 HTML footer sections — none have `.footer-tagline` or `data-tagline`

## Fix

1. Add `class="footer-tagline"` or `data-tagline` to the appropriate element in the footer template (the copyright/attribution line)
2. This makes the primary selector work and skips the fragile fallback
3. Bonus: fix the injected tagline font-size from 14px to 18px

## Evidence

- Grep for `footer-tagline` in frontend/*.html: 0 matches
- Grep for `data-tagline` in frontend/*.html: 0 matches
- app.js:1775 selector always fails, always uses fallback
