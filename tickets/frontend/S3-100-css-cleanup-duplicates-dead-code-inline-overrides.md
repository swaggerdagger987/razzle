---
id: S3-100
severity: S3
confidence: MEDIUM
category: frontend
source: DQ-111+127+134+152+153+187+189+220+234+300+451+452+453+492
status: OPEN
---

# CSS cleanup — duplicate selectors, dead code, inline overrides, !important

## Problems

1. **85+ `!important` declarations** (DQ-111) — styles.css (24), lab.html (39), lab-panels.css (7). Many can be resolved with proper specificity.
2. **10 duplicate CSS class definitions in styles.css** (DQ-127) — Cascade fragility from redefined classes.
3. **4 different max-width values on home page sections** (DQ-134) — Uneven section edges from 800/900/1000/1200px.
4. **38 duplicate CSS selectors across styles.css and lab-panels.css** (DQ-152) — Same selector defined in both files with conflicting properties.
5. **69 inline `style="display:none"`** (DQ-153) — Should use `.hidden` CSS class.
6. **`#columnPickerSearch` has massive inline style** (DQ-187) — Should use `.input-chunky` class.
7. **Active tab text color inconsistent** (DQ-189) — `var(--bg)` vs `var(--bg-card)` across 15 pages.
8. **15 selectors use hardcoded border-radius instead of tokens** (DQ-220) — Should use `var(--radius)` etc.
9. **No `@media print` styles** (DQ-234+300) — Pages print with dark backgrounds and nav chrome. Only cheatsheet.html has print CSS.
10. **`.btn-outline` used but never defined** (DQ-451) — 8 instances across 4 pages reference a class that doesn't exist in any CSS file.
11. **DES-058 incomplete — 305 sub-minimum border-radius remain** (DQ-452) — Previous fix left most instances untouched.
12. **DES-045 incomplete — footer CSS classes never created** (DQ-453) — 75 pages still have inline footer styles.
13. **Undo/redo buttons use inline styles** (DQ-492) — Bypass theming system.

## Fix

This is a large cleanup batch. Prioritize: remove `.btn-outline` references (broken), define print styles for data pages, deduplicate CSS selectors.

## Files

- `frontend/styles.css` — dedup, print styles, `.btn-outline` definition or removal
- `frontend/lab-panels.css` — dedup with styles.css
- `frontend/lab.html` — reduce `!important` count
- 75 HTML files — inline footer styles → CSS class

## Acceptance Criteria

1. No references to undefined CSS classes
2. Print output readable (white bg, no nav, data visible)
3. Duplicate selectors consolidated
4. `!important` count reduced by at least 50%
