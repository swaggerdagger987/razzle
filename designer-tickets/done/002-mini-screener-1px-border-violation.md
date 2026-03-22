---
id: DES-002
priority: P2
area: home page
section: LIVE MINI-SCREENER PREVIEW
type: design-violation
status: open
---

# Mini-screener table rows use 1px solid borders — DESIGN.md violation

## What's wrong

The live mini-screener preview on the home page (`index.html` line 406) uses `border-bottom: 1px solid var(--ink-faint)` on `.mini-table td` rows.

DESIGN.md explicitly says:
- **Don't**: "Thin 1px borders on primary elements"
- **Inside cards**: "Dashed dividers: 2px dashed var(--ink-faint)"

The mini-screener is inside `.screener-visual-card` (a 3px-bordered card with offset shadow). Its internal row dividers should follow the "dashed dividers inside cards" pattern: `2px dashed var(--ink-faint)`.

## Where

`frontend/index.html`, line 406:
```css
.mini-table td {
    border-bottom: 1px solid var(--ink-faint);  /* WRONG */
}
```

## Fix

Change line 406 to:
```css
.mini-table td {
    border-bottom: 2px dashed var(--ink-faint);  /* matches DESIGN.md */
}
```

One line. No side effects — `.mini-table` is only used in the home page mini-screener.

## Why this matters for conversion

The mini-screener is the first interactive element visitors see. It's a demo of the Screener — the product's growth engine. Thin solid borders make it look like a generic HTML table. Chunky dashed dividers make it look like a Razzle table — consistent with the comic-strip aesthetic. First impressions determine whether someone clicks "Open the full Screener." The details are the brand.
