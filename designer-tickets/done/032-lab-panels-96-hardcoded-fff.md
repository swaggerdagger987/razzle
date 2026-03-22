# DES-032: Lab panel badges — 96 instances of hardcoded color:#fff without CSS variable

**Priority**: P2
**Area**: lab-panels.css (sitewide panels)
**Impact**: lab-panels.css contains 96 instances of `color: #fff` or `color: white` across position badges, tier badges, grade badges, and view buttons. While most sit on colored backgrounds and look fine today, they bypass the design system and make future dark mode improvements impossible without touching 96 lines.

## The Problem

`frontend/lab-panels.css` — 96 occurrences including:
```css
/* Position badges — 40+ variants */
.tv-pos-badge { color: #fff; }     /* line 597 */
.vorp-pos-badge { color: #fff; }   /* line 697 */
.pa-pos-badge { color: #fff; }     /* line 748 */
.av-pos-badge { color: #fff; }     /* line 773 */
.se-pos-badge { color: #fff; }     /* line 1901 */
.wl-pos-badge { color: #fff; }     /* line 1936 */
.dt-pos-badge { color: #fff; }     /* line 1975 */
.tp-pos-badge { color: #fff; }     /* line 2012 */
/* ... 30+ more pos-badge variants */

/* Tier badges */
.tier-1 .rankings-tier-badge { color: #fff; }  /* line 187 */
.tier-2 .rankings-tier-badge { color: #fff; }  /* line 188 */

/* Grade badges */
.po-grade-F { background: var(--red); color: #fff; }  /* line 2626 */

/* View buttons */
.lp-view-btn.active { background: var(--orange); color: #fff; }  /* line 296 */
```

## The Fix

Add a single CSS variable and replace all 96 instances:

```css
:root {
  --text-on-accent: white;
}
[data-theme="dark"] {
  --text-on-accent: var(--bg);  /* sand on dark backgrounds */
}
```

Then find-and-replace across lab-panels.css:
- `color: #fff;` → `color: var(--text-on-accent);`
- `color: white;` → `color: var(--text-on-accent);`

## Why This Matters

This is the largest single CSS variable adoption gap in the codebase. Fixing it systemically means every future dark mode or theme change automatically cascades to all 96 badges. Without the variable, every theme change requires touching 96 lines.
