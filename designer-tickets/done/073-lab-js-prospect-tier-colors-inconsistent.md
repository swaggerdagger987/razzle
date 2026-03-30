# DES-073: lab.js prospect tier colors inconsistent between 3 copies

**Priority**: P2
**Area**: frontend/lab.js (prospect scoring — 3 different tier definitions)
**Cycle**: 7

## Problem

The prospect scoring system defines tier colors 3 times with DIFFERENT values:

### Copy 1: Prospect Big Board canvas (line 8407)
```javascript
{ key: "elite", label: "ELITE", color: "#2ec4b6" },     // green
{ key: "premium", label: "PREMIUM", color: "#2ec4b6" },  // green (SAME as elite!)
{ key: "solid", label: "SOLID", color: "#ffc857" },       // yellow
{ key: "flier", label: "FLIER", color: "#d97757" },       // orange
```

### Copy 2: Trade Value Chart DOM (line 9059)
```javascript
{ name: "Elite", min: 85, color: "#2ec4b6", badge: "ELITE" },    // green
{ name: "Star", min: 70, color: "#5b7fff", badge: "STAR" },       // blue
{ name: "Starter", min: 55, color: "#d97757", badge: "STARTER" }, // orange
{ name: "Bench", min: 0, color: "#8a7565", badge: "BENCH" },      // ink-light
```

### Copy 3: Trade Value PNG export (line 9248)
```javascript
// Identical to Copy 2
```

**Bug**: Copy 1 gives elite and premium the SAME color (both green). Users can't visually distinguish elite from premium prospects in the Big Board export. Copies 2-3 use different colors per tier.

This is likely a bug — elite and premium should be visually distinct.

## Fix

1. Decide on ONE canonical tier color mapping
2. Consolidate into a single constant (see DES-070)
3. Ensure elite and premium are visually distinct

Suggested mapping: Elite = green, Premium = blue, Solid = orange/yellow, Flier = purple

## Design Rule

Consistency. The same tier system should use the same colors everywhere.
