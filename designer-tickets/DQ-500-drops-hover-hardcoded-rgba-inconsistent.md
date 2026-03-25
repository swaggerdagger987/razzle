---
id: DQ-500
title: drops.html hover uses hardcoded rgba while sibling pages use var(--bg-warm)
severity: P3
status: open
component: Standalone Pages
phase: Phase 136
---

## Problem

The drop rate standalone page uses a hardcoded `rgba(217,119,87,0.08)` for table row hover, while other pages built in the same batch use `var(--bg-warm)`:

| Page | Hover rule | Pattern |
|------|-----------|---------|
| drops.html:53 | `rgba(217,119,87,0.08)` | Hardcoded |
| gamescript.html:53 | `var(--bg-warm)` | CSS var |
| successrate.html:50 | `var(--bg-warm)` | CSS var |
| workload.html:50 | `var(--bg-warm)` | CSS var |
| targetpremium.html | `var(--bg-warm)` | CSS var |
| snapefficiency.html | `var(--bg-warm)` | CSS var |

This inconsistency means drops.html doesn't automatically adapt to dark mode, while sibling pages do. The `var(--bg-warm)` pattern is the correct approach.

## Location

- `frontend/drops.html:53`

```css
.dr-table tbody tr:hover { background: rgba(217,119,87,0.08); }
```

## Fix

```css
.dr-table tbody tr:hover { background: var(--bg-warm); }
```

## Acceptance Criteria

- [ ] drops.html row hover uses `var(--bg-warm)` instead of hardcoded rgba
- [ ] Hover is visible in both light and dark mode
