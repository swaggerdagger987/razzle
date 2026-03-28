# S1-026: GP filter tag uses non-existent --bg-sand CSS variable

**Severity**: S1 (High)
**Category**: frontend
**Source**: designer-tickets/DQ-172
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/lab.js:3313` — The GP (Games Played) filter tag uses inline style `background:var(--bg-sand)` which doesn't exist in styles.css. The tag renders with no background, making it visually broken compared to other filter tags.

```javascript
// lab.js:3313
html += `<span class="filter-tag" style="background:var(--bg-sand);">GP ≥ ${state.minGP} <span class="remove" ...>×</span></span> `;
```

Defined CSS variables in styles.css:
- `--bg: #ede0cf` (sand color)
- `--bg-warm: #e5d5c3`
- `--bg-card: #f7efe5`

The `.filter-tag` class already has `background: var(--yellow-light)` in lab.html:775, but the inline style overrides it with the broken variable.

## Fix

Replace `var(--bg-sand)` with `var(--bg)` or remove the inline style entirely (let the `.filter-tag` class handle it).

## Files to Change

- `frontend/lab.js:3313` — fix CSS variable name

## Accept When

1. GP filter tag has a visible background that matches other filter tags
2. No references to `--bg-sand` anywhere in the codebase
