# FUNC-053: Compare Panel — Broken in START HERE Section

**Severity**: P1
**Flow**: Compare panel in Lab (flow 16, sidebar)
**Found**: Session 49 (2026-03-21)
**Status**: OPEN
**Related**: None

## Description

The "Compare" item in the **START HERE** section of the Lab sidebar is broken. Clicking it either shows a Pro upgrade gate (for free users) or renders a blank panel (for Pro users). This is misleading because START HERE items are presented as core free features.

### Root Cause — 3 Compounding Issues

| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | No panel definition for "compare" | lab-panels.js | Nothing to render — panelRegistry has no entry |
| 2 | "compare" missing from FREE_PANELS | lab.html:4046-4049 | switchPanel() shows Pro upgrade gate for free users |
| 3 | Sidebar item uses wrong panel name | lab.html:3159 | `data-panel="compare"` but only `career-compare` exists |

### What the User Sees

**Free user**: Clicks "Compare" in START HERE → sees "COMPARE IS A PRO PANEL" with lock icon and upgrade CTA. This is deceptive — START HERE implies these are the free flagship features.

**Pro user**: Clicks "Compare" → switchPanel bypasses Pro gate → calls `showNewPanel()` → hides all panels → `panelRegistry["compare"]` is undefined → nothing renders → blank content area.

### Code Evidence

```javascript
// lab.html:3159 — sidebar item (NOT pro-locked, in START HERE section)
<a class="lab-sidebar-item start-here-item" data-panel="compare"
   onclick="switchPanel('compare');_trackStartHere()">Compare
   <span class="start-here-hint">head-to-head matchups</span></a>

// lab.html:4045-4049 — FREE_PANELS (compare NOT listed)
var FREE_PANELS = {
    screener: true, rankings: true, tiers: true, tradevalues: true,
    cheatsheet: true, breakouts: true, weekly: true, prospects: true,
    dashboard: true, leaders: true
};

// lab-panels.js — panel definitions (no "compare", only "career-compare")
defs.push({ name: 'career-compare', render: function(el) { ... } });
// No: defs.push({ name: 'compare', ...
```

## Fix Options

**Option A (recommended)**: Point sidebar to existing panel + add to free list
```javascript
// lab.html:3159 — change panel name to career-compare
data-panel="career-compare"

// lab.html:4046 — add to FREE_PANELS
'career-compare': true
```

**Option B**: Create a dedicated "compare" panel definition that wraps career-compare or provides a simpler 2-player compare UI.

**Option C**: Remove "Compare" from START HERE section if it's meant to be Pro-only.

## Verification

1. Open Lab as unauthenticated user
2. Click "Compare" in START HERE section
3. Panel should load with player comparison UI (search inputs, chart, stat table)
4. Should NOT show Pro upgrade gate
