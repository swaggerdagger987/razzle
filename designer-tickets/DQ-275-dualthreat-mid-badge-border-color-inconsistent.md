# DQ-275: dualthreat.html mid-tier badge uses --yellow border — siblings use --ink-medium

**Priority**: P2 — Visual inconsistency across 5 sibling pages
**Category**: Cross-page Consistency
**Severity**: MEDIUM — One page looks different from the identical pattern on 4 others

## Problem

dualthreat.html line 56 defines the mid-tier badge border as `border-color: var(--yellow)`, while all 4 sibling pages (garbagetime, workload, targetpremium, snapefficiency) use `border-color: var(--ink-medium)` for the same tier.

**dualthreat.html (line 56) — WRONG:**
```css
.dt-dti-mid { background: var(--yellow-light); color: var(--ink-medium); border-color: var(--yellow); }
```

**garbagetime.html (line 58) — CORRECT:**
```css
.gt-tier-mid { background: var(--yellow-light); color: var(--ink-medium); border-color: var(--ink-medium); }
```

Same correct pattern on workload.html:55, targetpremium.html:56, snapefficiency.html:56.

## Fix

Change dualthreat.html line 56:
```css
.dt-dti-mid { background: var(--yellow-light); color: var(--ink-medium); border-color: var(--ink-medium); }
```

## Files
- `frontend/dualthreat.html` line 56
