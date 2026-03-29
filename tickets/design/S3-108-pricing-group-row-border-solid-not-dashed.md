---
id: S3-108
severity: S3
confidence: HIGH
category: design
source: DQ-473
status: OPEN
---

# Pricing feature matrix group rows use solid border instead of dashed

## Root Cause

DESIGN.md specifies `2px dashed var(--ink-faint)` for dividers inside cards. The pricing comparison table group header rows use `solid` instead.

**File**: `frontend/pricing.html:144`

```css
.feature-matrix .group-row td {
  border-bottom: 2px solid var(--ink-faint); /* WRONG: should be dashed */
}
```

Regular data rows correctly use dashed at line 138:
```css
.feature-matrix td {
  border-bottom: 2px dashed var(--ink-faint); /* correct */
}
```

## Fix

```css
.feature-matrix .group-row td {
  border-bottom: 2px dashed var(--ink-faint);
}
```

If group rows need visual distinction from data rows, use `border-bottom: 3px solid var(--ink)` (heavier weight, full ink color) per the card border pattern.

## Acceptance Criteria

- [ ] Group row borders use `dashed` or intentionally heavier `3px solid var(--ink)`
- [ ] Consistent with DESIGN.md divider rules
