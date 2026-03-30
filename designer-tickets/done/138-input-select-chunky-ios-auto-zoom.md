# DES-138: .input-chunky (13px) + .select-chunky (12px) trigger iOS auto-zoom

**Priority:** P1 — Mobile UX (Growth Engine)
**Component:** styles.css
**Affects:** Every filter input, search box, and select dropdown in the Lab screener

## Problem

iOS Safari auto-zooms the page when a user taps into any text input or select with `font-size` below 16px. The Lab screener's core filter controls are affected:

- `.input-chunky` — `font-size: 13px` (styles.css:914)
- `.select-chunky` — `font-size: 12px` (styles.css:941)

Neither has a mobile breakpoint override bumping to 16px. When a user taps a filter input on iPhone:
1. The page zooms in
2. The filter dropdown becomes misaligned
3. The user has to manually pinch-zoom back out
4. This happens on EVERY filter interaction

The Screener is the growth engine. Every screenshot, every Reddit link, opens the Lab. If the first thing a mobile user does (add a filter) zooms the page unexpectedly, they bounce.

## Evidence

- `frontend/styles.css:914` — `.input-chunky { font-size: 13px; }`
- `frontend/styles.css:941` — `.select-chunky { font-size: 12px; }`
- `frontend/styles.css:956-1000` — `@media (max-width: 768px)` block — NO font-size override for either class
- `frontend/styles.css:1268-1300` — `@media (max-width: 480px)` block — NO font-size override either
- Contrast: `.auth-form input` (line 717) uses `font-size: 16px` — already correct
- Contrast: `.cmd-palette-input` (line 1093) uses `font-size: 18px` — already correct

## Fix

Add to the existing `@media (max-width: 768px)` block in `frontend/styles.css`:

```css
.input-chunky,
.select-chunky {
  font-size: 16px;
}
```

This prevents iOS zoom while maintaining the smaller size on desktop where it's appropriate.

## Why it matters

Mobile is 62% of fantasy football traffic. Twitter and Reddit links from launch are overwhelmingly mobile. The Screener is the first thing users interact with. If every filter tap zooms the page, we lose them.
