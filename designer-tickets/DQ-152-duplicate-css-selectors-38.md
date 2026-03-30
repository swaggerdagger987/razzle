---
id: DQ-152
priority: P3
area: css-architecture
section: maintainability
type: tech-debt
status: open
---

# 38 duplicate CSS selectors across styles.css and lab-panels.css

## What's wrong

Same selector appears multiple times in the same stylesheet, creating split rule definitions that are hard to maintain and increase file size. 18 in styles.css, 20 in lab-panels.css.

## Where

**styles.css (18 duplicates):**
- `.auth-modal` (2x), `.btn-chunky, .btn-primary` (2x), `.chip` (2x)
- `.cmd-palette-backdrop` (2x), `.cmd-palette-input` (2x)
- `.logo-mark` (2x), `.logo-text` (2x), `.nav-links a` (2x)
- `.nav-search-hint` (2x), `.topnav` (2x), `body` (2x)
- `.cmd-palette-item .player-headshot-fallback` (2x), `.cmd-palette-item.active` (2x)
- `@media (max-width: 375px)` (2x), `@media (max-width: 480px)` (2x), `@media (max-width: 768px)` (2x)

**lab-panels.css (20 duplicates):**
- `.ag-card-value`, `.ag-summary`, `.av-summary`, `.ay-player-cell`, `.cmt-player-cell`
- `.cs-grid`, `.cst-chip`, `.cst-chip-val`, `.hide-mobile`, `.lp-page`
- `.lp-pos-tab`, `.lp-select`, `.md-board-cell`, `.pbd-details`, `.pt-grid`
- `.rpc-player-cell`, `.scarcity-bar-name`, `.scarcity-summary`, `.tv-methodology`
- `.tv-weight-slider input[type="range"]`

## Fix

For each duplicate selector, merge the two rule blocks into one. Keep the rules from the later definition where they override the earlier one. For duplicate media queries, merge into a single block.

## Why it matters

Split selectors make it impossible to understand a component's styles at a glance. When the Ship agent changes `.chip` padding, they need to find BOTH definitions or the fix is incomplete.
