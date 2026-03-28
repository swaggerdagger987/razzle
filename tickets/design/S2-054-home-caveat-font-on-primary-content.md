# S2-054: Home page uses Caveat (handwriting) font on primary selling content

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets/DQ-052
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/index.html:94,259` — The hero subtitle and section body text use `var(--font-hand)` (Caveat), a handwriting font meant for annotations and notes. Using it on primary selling content reduces readability and doesn't match DESIGN.md's intent.

```css
/* index.html:94 */
.hero-sub {
  font-family: var(--font-hand);  /* Caveat — handwriting */
  font-size: 24px;
}

/* index.html:259 */
.lp-section p {
  font-family: var(--font-hand);  /* Caveat — handwriting */
  font-size: 20px;
}
```

DESIGN.md specifies Caveat for "handwritten annotations, margin notes, personality quips" — not section headings or marketing copy.

## Fix

Change both to `var(--font-mono)` (Space Mono) for body text or `var(--font-display)` (Luckiest Guy) for hero elements. The hero subtitle could use Space Mono at 20px for a data-forward feel.

## Files to Change

- `frontend/index.html:94` — `.hero-sub` font-family
- `frontend/index.html:259` — `.lp-section p` font-family

## Accept When

1. Hero subtitle readable at all screen sizes
2. Section body text uses appropriate font (not handwriting)
3. Caveat only used for annotations/notes/personality quips
