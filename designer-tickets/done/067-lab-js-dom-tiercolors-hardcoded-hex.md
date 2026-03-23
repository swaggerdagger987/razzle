# DES-067: lab.js DOM tierColors object uses hardcoded hex instead of CSS vars

**Priority**: P1
**Area**: frontend/lab.js (Draft Class Comparison panel — DOM HTML)
**Cycle**: 7

## Problem

The draft class comparison panel generates DOM HTML using a `tierColors` object with hardcoded hex values:

```javascript
// Line 8612
const tierColors = { elite: "#d97757", premium: "#5b7fff", solid: "#2ec4b6", flier: "#8b5cf6" };
```

These colors are injected into `innerHTML` template literals as `background:${tierColors[tier]}` (lines 8653, 8658). Since this is DOM HTML — NOT canvas — it should use CSS variables that respect dark mode.

**Dark mode impact**: On dark espresso background, these hex colors render identically to light mode. CSS vars would let the design system control the tint.

## Instances

- Line 8612: `tierColors` definition
- Line 8653: `background:${tierColors[tier]}` — tier distribution bar segments
- Line 8658: `color:${tierColors[tier]}` — tier label text colors

## Fix

```javascript
const tierColors = {
  elite: "var(--orange)",
  premium: "var(--blue)",
  solid: "var(--green)",
  flier: "var(--purple)"
};
```

## Design Rule

DESIGN.md: Position/accent colors have CSS variable tokens. DOM-generated HTML should reference tokens, not hex.
