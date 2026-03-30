# DQ-114: `.style.cssText` mega-strings in JS bypass theming

**Priority**: P2 (dark mode / design system)
**Category**: CSS Architecture
**Severity**: Medium — creates un-themeable DOM elements invisible to CSS audits

## Problem

27 instances across 7 JS files use `.style.cssText = "..."` to write full CSS declarations as JavaScript strings. Each call creates a DOM element with 5-10 inline CSS properties that:

- Cannot be overridden by dark mode CSS (inline styles beat class selectors)
- Are invisible to any CSS audit or linting tool
- Break when design tokens change (hardcoded values in JS strings)
- Cannot be discovered by searching CSS files

### Breakdown by file

| File | Instances | Worst example |
|------|-----------|---------------|
| `lab.js` | 13 | Nudge tooltip, modal overlay, formula badge, shortcut help |
| `app.js` | 8 | Welcome overlay, confetti, ad container, popup |
| `player.js` | 2 | Player overlay, toast |
| `formulas.js` | 1 | Formula type badge with `border-radius:4px` (off-token) |
| `formula-store.js` | 1 | Toast notification |
| `compare.js` | 1 | Toast notification |
| `agent-nudges.js` | 1 | Nudge element |

### Example (lab.js line 1187)

```javascript
nudge.style.cssText = "position:fixed;bottom:80px;right:20px;background:var(--bg-card);
border:3px solid var(--ink);border-radius:12px;padding:12px 16px;
font-family:var(--font-hand);font-size:16px;color:var(--ink);
box-shadow:4px 4px 0 var(--ink);z-index:100;transform:rotate(-1deg);
cursor:pointer;max-width:260px;";
```

This particular example uses CSS vars (good), but many others use hardcoded values.

## Fix

For each `.style.cssText` call:
1. Create a CSS class in `styles.css` or `lab-panels.css` with the same properties
2. Replace `el.style.cssText = "..."` with `el.className = 'class-name'`
3. Verify dark mode works (class-based styles can be overridden by `[data-theme="dark"]`)

## Not a duplicate of

- DQ-070 (agents long inline styles) — covers agents.html HTML inline styles. This covers JS-created inline styles via `.style.cssText`.
- done/051 (lab-panels.js hardcoded hex DOM inline) — covers hardcoded HEX VALUES in `.style.property =`. This covers the `.style.cssText` DELIVERY MECHANISM with full CSS strings.
