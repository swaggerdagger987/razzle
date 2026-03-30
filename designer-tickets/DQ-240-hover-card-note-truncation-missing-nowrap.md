---
id: DQ-240
priority: P3
category: UX / Lab
pages: styles.css (affects lab.html hover cards)
status: open
cycle: 33
---

# Hover card note text doesn't truncate — overflows card on long notes

## What's wrong

In `styles.css` lines 1556-1567, `.hover-card-note` has `overflow: hidden` and `text-overflow: ellipsis` but is missing `white-space: nowrap`:

```css
.hover-card-note {
  font-family: var(--font-hand);
  font-size: 13px;
  color: var(--ink-medium);
  padding: 4px 0 0;
  border-top: 2px dashed var(--ink-faint);
  /* missing: white-space: nowrap; */
  /* missing: overflow: hidden; text-overflow: ellipsis; */
}
```

Player notes can be up to 140 characters (Phase 52 feature). Without `white-space: nowrap`, the text wraps to multiple lines inside the hover card instead of truncating with an ellipsis. This makes hover cards unpredictably tall — a 140-char note could add 3-4 extra lines to the card, pushing it off-screen or overlapping other elements.

## Fix

Add truncation properties:

```css
.hover-card-note {
  /* existing properties... */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}
```

Or if multi-line is desired, use `-webkit-line-clamp: 2` to limit to 2 lines:

```css
.hover-card-note {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## Verification

Add a 140-character note to a player in the Lab. Hover over that player. The note should truncate cleanly within the hover card boundaries.
