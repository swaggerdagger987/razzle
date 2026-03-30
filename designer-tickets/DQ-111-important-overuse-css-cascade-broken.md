# DQ-111: `!important` overuse — CSS specificity cascade broken

**Priority**: P2 (design system governance)
**Category**: CSS Architecture
**Severity**: Medium — does not break visuals today but makes every future CSS change fragile

## Problem

81 `!important` declarations across 3 core files:
- `frontend/lab.html`: **46 instances** (worst offender)
- `frontend/styles.css`: **28 instances**
- `frontend/lab-panels.css`: **7 instances**

When one file needs 46 `!important` to make responsive styles work, the specificity cascade is inverted — base styles have higher specificity than `@media` queries. Every new CSS change risks a specificity war.

## Evidence (grep counts)

```
lab.html:46
styles.css:28
lab-panels.css:7
```

Most lab.html `!important` are in `@media` blocks forcing mobile overrides:
```css
@media (max-width: 768px) {
  display: none !important;   /* line 174 */
  padding-top: 6px !important; /* line 198 */
}
```

## Fix

1. **lab.html**: Reduce base style specificity so `@media` queries win naturally. Move high-specificity base rules to lower-specificity selectors, or restructure to mobile-first where `@media (min-width)` adds desktop styles.
2. **styles.css**: Audit each `!important` — most can be replaced by reordering rules or adding one specificity level (`.page .element` instead of `!important`).
3. **lab-panels.css**: 7 instances, fix alongside styles.css.
4. **Goal**: Zero `!important` in production CSS (except user-agent overrides if needed).

## Not a duplicate of

- DQ-082 (btn padding inconsistent) — about values, not specificity
- DQ-066 (max-width inconsistency) — about values, not cascade
