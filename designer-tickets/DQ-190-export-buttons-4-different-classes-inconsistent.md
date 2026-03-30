---
id: DQ-190
priority: P3
category: css-consistency/components
status: open
cycle: 27
---

# Export buttons use 4+ different CSS classes across standalone pages — should standardize

## What's wrong

The "Export PNG" button appears on 40+ standalone pages but uses at least 4 different implementations:

| Class | Style | Pages using it |
|-------|-------|---------------|
| `.btn-chunky` | Shared styles.css class (correct) | aging, airyards, awards, buysell, breakouts, consistency, etc. |
| `.pa-export` | Custom one-off class (advantage.html) | advantage only |
| `.ar-export-btn` | Custom one-off class (archetypes.html) | archetypes only |
| `.btn .btn-primary` | Filled orange button (career-compare) | career-compare only |
| `.av-export-btn` | Custom one-off class (auction.html) | auction only |

Result: the export button looks different on every other page. Some have hover lifts, some don't. Some are outlined, one is filled orange. This is a jarring inconsistency when navigating between pages.

## Where

Examples:
- `advantage.html:39` — `.pa-export` (custom, outlined, no shadow)
- `archetypes.html:75-86` — `.ar-export-btn` (custom, orange hover fill)
- `career-compare.html:329` — `.btn .btn-primary` (filled orange)
- `auction.html:257-267` — `.av-export-btn` (custom)
- `aging.html:330` — `.btn-chunky` (shared, correct)

## Fix

Replace all custom export button classes with `.btn-chunky`:

```html
<button class="btn-chunky" id="export-btn" title="Export as PNG">Export PNG</button>
```

Remove the custom per-page CSS rules (`.pa-export`, `.ar-export-btn`, `.av-export-btn`).

For career-compare.html, change `.btn .btn-primary` to `.btn-chunky` to match the outlined export pattern.

## Test

1. Navigate between 5+ pages with export buttons (aging → advantage → archetypes → career-compare → auction).
2. Export button should look identical on all pages — outlined, chunky border, hover lift.
