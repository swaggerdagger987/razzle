# DQ-279: styles.css overflow:hidden clips 4px box-shadow on nav-dropdown and cmd-palette

**Priority**: P2 — Signature chunky shadow clipped on 2 global components
**Category**: Layout / Visual
**Severity**: MEDIUM — Shadow clipping visible on every page (nav dropdown) and every Ctrl+K invocation

## Problem

Two elements in styles.css have both `box-shadow: 4px 4px 0 var(--ink)` and `overflow: hidden`, which clips the bottom-right offset shadow:

1. **Line 577**: `.nav-user-dropdown` — visible on every page when user clicks their name
2. **Line 1090**: `.cmd-palette` — visible on every Ctrl+K invocation

DQ-022 covered this pattern in lab-panels.css cards, but these two instances in styles.css were not included.

## Fix

For both selectors, either:

**Option A** — Remove overflow:hidden and clip children instead:
```css
.nav-user-dropdown { overflow: visible; }
.nav-user-dropdown .nav-dropdown-menu { overflow: hidden; }
```

**Option B** — Add margin/padding to compensate:
```css
.nav-user-dropdown { padding-bottom: 4px; padding-right: 4px; }
```

**Option C** — Use clip-path instead of overflow:hidden if the intent is to contain rounded corners.

## Files
- `frontend/styles.css` line 577 (.nav-user-dropdown)
- `frontend/styles.css` line 1090 (.cmd-palette)
