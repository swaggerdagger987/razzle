---
id: DQ-079
priority: P3
category: architecture
status: open
---

# DQ-079: z-index values scattered across inline HTML — no system

## Problem
DQ-029 flagged z-index hierarchy in styles.css as undocumented. This ticket covers the **HTML inline style** z-index chaos — values sprayed across 30+ inline `style=` attributes with no coherent system.

Current z-index zoo (from grep of HTML files):
- `z-index: 1` — table columns
- `z-index: 2` — table overlays, matchup layers
- `z-index: 3` — sticky columns
- `z-index: 5` — column resize handles
- `z-index: 10` — sticky headers, explorer legend, agents overlay
- `z-index: 11` — column groups
- `z-index: 50` — toolbar
- `z-index: 100` — modals in career, breakdown, comptable, gamelog pages
- `z-index: 199` — modal backdrops
- `z-index: 200` — overlays
- `z-index: 999` — watermarks (all 32+ pages)
- `z-index: 1000` — config panels
- `z-index: 9999` — skip links, toasts
- `z-index: 10001` — shortcut modal

14 distinct values, no CSS custom properties, all hardcoded in inline styles.

## Fix
Define z-index tokens in styles.css:
```css
--z-base: 1;
--z-sticky: 10;
--z-toolbar: 50;
--z-modal-backdrop: 100;
--z-modal: 200;
--z-watermark: 500;
--z-overlay: 900;
--z-toast: 1000;
--z-skip: 1100;
```

Then replace inline z-index values with `var(--z-*)` references. This prevents the z-index arms race (10001 beating 10000 beating 9999...).

## Scope
40+ inline style replacements across 30+ files. Define tokens first, then find-replace.
