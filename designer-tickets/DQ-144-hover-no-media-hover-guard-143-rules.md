---
id: DQ-144
priority: P1
area: responsive
section: touch-devices
type: interaction-bug
status: open
---

# :hover effects fire on touch devices — 143 rules, zero @media (hover: hover) guards

## What's wrong

143 `:hover` rules across styles.css (22) and lab-panels.css (121) fire on touch devices. On mobile, tapping an element triggers the hover state, which "sticks" — cards stay lifted, buttons stay highlighted, backgrounds stay tinted until the user taps elsewhere. This is a well-known mobile UX issue.

The fix: wrap hover-only effects (shadow changes, transforms, background tints) inside `@media (hover: hover) { }` so they only apply on devices with a real hover pointer.

## Where

- `styles.css` — 22 `:hover` rules (nav links, buttons, chips, tags, theme toggle, etc.)
- `lab-panels.css` — 121 `:hover` rules (panel cards, table rows, badges, charts, etc.)
- 0 instances of `@media (hover: hover)` anywhere in the frontend

## Fix

Wrap cosmetic hover effects in a media query. Focus and click states remain ungated.

**Before:**
```css
.btn-chunky:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

**After:**
```css
@media (hover: hover) {
  .btn-chunky:hover {
    box-shadow: 6px 6px 0 var(--ink);
    transform: translate(-2px, -2px);
  }
}
```

Group the hover rules into one `@media (hover: hover) { }` block per file rather than wrapping each rule individually.

**Do NOT gate:** `:hover` on links that change color (users expect feedback), or `:hover` combined with `:focus-visible` (keyboard users need this).

## Why this matters

On mobile Safari and Chrome, every card, button, and chip "sticks" in hover state after tap. The comic-strip lift effect — designed to feel physical — becomes a UX annoyance where elements stay raised until you tap the background. This affects every mobile user.
