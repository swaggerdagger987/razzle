---
id: DES-009
priority: P1
area: sitewide (styles.css)
status: open
created: 2026-03-22
---

# DES-009: Logo text "Razzle.lol" uses wrong font — Space Mono instead of Luckiest Guy

## What's Wrong

`.logo-text` in `frontend/styles.css` (line 169) has no `font-family` declaration:

```css
.logo-text {
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.5px;
}
```

It inherits `body { font-family: var(--font-mono); }` — Space Mono.

DESIGN.md says nav labels and headings use `var(--font-display)` (Luckiest Guy). The logo IS the brand identity — the first thing every visitor reads. It should be in the display font.

## Why It Matters

The logo appears on every single page. "Razzle.lol" in Space Mono looks like a developer tool. In Luckiest Guy it looks like the playful, comic-strip brand it's meant to be. This is the single most-visible font decision on the entire site.

## Fix

Add `font-family: var(--font-display);` to `.logo-text` in `frontend/styles.css`.

```css
.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.5px;
}
```

Test at mobile sizes (14px, 13px per breakpoint overrides) to make sure Luckiest Guy is legible at those sizes.

## Files

- `frontend/styles.css` — `.logo-text` (line 169)
