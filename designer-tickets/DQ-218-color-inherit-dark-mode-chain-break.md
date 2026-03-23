# DQ-218: color:inherit in 2 selectors breaks dark mode color chain

**Priority**: P2
**Category**: Dark mode
**Page**: Lab (search highlight), Tools Hub

## What's wrong

Two CSS selectors use `color: inherit` which creates fragile color inheritance chains. If a parent element has a hardcoded light-mode color, the child inherits it in dark mode — causing invisible or low-contrast text.

## Where

- `styles.css:894` — `.search-hl { color: inherit; }` — search highlight text inherits from parent row. If the row has a hardcoded color, the highlight text will be wrong in dark mode.
- `tools.html:167` — `.tool-card a { color: inherit; }` — tool card links inherit from the card. If the card background changes in dark mode but the inherited text color doesn't update, links become invisible.

## Fix

Replace `color: inherit` with explicit dark-mode-safe values:
```css
.search-hl { color: var(--ink); }
.tool-card a { color: var(--ink); }
```

These will automatically flip in dark mode via the CSS variable overrides.

## Not a dupe of

- DQ-042 (color white 121 instances) — that's about hardcoded white, not inherit
- DQ-098 (ink-light dark mode contrast) — that's about specific ink-light contrast, not inheritance chains
