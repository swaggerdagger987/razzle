# DES-068: lab.js DOM trade value tier badges use hardcoded hex

**Priority**: P1
**Area**: frontend/lab.js (Trade Value Chart panel — DOM HTML)
**Cycle**: 7

## Problem

The trade value chart panel generates DOM HTML with tier badge colors using hardcoded hex:

```javascript
// Lines 9059-9062
const tiers = [
  { name: "Elite", min: 85, color: "#2ec4b6", badge: "ELITE" },
  { name: "Star", min: 70, color: "#5b7fff", badge: "STAR" },
  { name: "Starter", min: 55, color: "#d97757", badge: "STARTER" },
  { name: "Bench", min: 0, color: "#8a7565", badge: "BENCH" },
];
```

Used in DOM HTML at line 9086: `background:' + tier.color + ';` — this is a rotated sticker badge rendered directly in the page DOM, not on canvas. Should use CSS vars.

## Fix

```javascript
const tiers = [
  { name: "Elite", min: 85, color: "var(--green)", badge: "ELITE" },
  { name: "Star", min: 70, color: "var(--blue)", badge: "STAR" },
  { name: "Starter", min: 55, color: "var(--orange)", badge: "STARTER" },
  { name: "Bench", min: 0, color: "var(--ink-light)", badge: "BENCH" },
];
```

## Design Rule

DESIGN.md: All accent colors have CSS variable tokens. DOM elements use `var(--color)`, not hex.
