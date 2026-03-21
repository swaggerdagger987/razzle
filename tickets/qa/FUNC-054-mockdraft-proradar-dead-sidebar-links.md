# FUNC-054: Mock Draft & Athletic Radar — Dead Sidebar Links

**Severity**: P2
**Flow**: Sidebar navigation (flow 57)
**Found**: Session 49 (2026-03-21)
**Status**: OPEN
**Related**: FUNC-053 (same root cause pattern — sidebar item with no panel definition)

## Description

Two Pro-locked sidebar items have no corresponding panel definitions in lab-panels.js. For free users, they show the standard Pro upgrade gate (acceptable). For Pro/Elite users, clicking them produces a **blank content area** — all panels hide but nothing new renders.

### Affected Items

| Sidebar Item | Panel Name | Sidebar Line | Pro-Locked | Panel Def |
|---|---|---|---|---|
| Mock Draft | `mockdraft` | lab.html:3232 | Yes | **MISSING** |
| Athletic Radar | `proradar` | lab.html:3233 | Yes | **MISSING** |

### What Pro Users See

1. Click "Mock Draft" or "Athletic Radar" in sidebar
2. `switchPanel('mockdraft')` / `switchPanel('proradar')` is called
3. Pro user passes the FREE_PANELS gate (isPaidUser() returns true)
4. `showNewPanel()` runs → hides all panels
5. `panelRegistry["mockdraft"]` is undefined → `if (entry)` is false
6. Nothing renders → blank content area with breadcrumb header only

### Code Evidence

```html
<!-- lab.html:3232-3233 -->
<a class="lab-sidebar-item pro-locked" data-panel="mockdraft" data-icon="🎯"
   onclick="switchPanel('mockdraft')">Mock Draft
   <span class="sidebar-tooltip">Simulate a dynasty rookie draft</span></a>
<a class="lab-sidebar-item pro-locked" data-panel="proradar" data-icon="◎"
   onclick="switchPanel('proradar')">Athletic Radar
   <span class="sidebar-tooltip">Prospect combine spider charts</span></a>
```

```javascript
// lab-panels.js — NO definitions for mockdraft or proradar
// Closest: defs.push({ name: 'prospects', ... })  — Big Board (different panel)
```

## Fix Options

**Option A (recommended)**: Remove the sidebar items until the panels are built. Dead links erode trust with paying users.

```html
<!-- Delete lines 3232-3233 from lab.html -->
```

**Option B**: Build the panel definitions (significant work — new render functions + possibly new API endpoints).

**Option C**: Add a "Coming Soon" placeholder panel that renders when no panelRegistry entry exists, so users see an explanation instead of a blank page.

## Verification

1. Log in as Pro user
2. Click "Mock Draft" in sidebar → should either load a panel or show "Coming Soon" (not blank)
3. Click "Athletic Radar" in sidebar → same
4. If Option A: items should not appear in sidebar at all
