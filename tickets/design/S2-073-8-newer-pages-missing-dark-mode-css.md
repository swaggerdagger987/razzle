---
id: S2-073
severity: S2
confidence: HIGH
category: design
source: DQ-495
status: OPEN
---

# 8 newer standalone pages (Phases 131-140) have zero dark mode CSS overrides

## Root Cause

These 8 pages were built in later phases and have no `[data-theme="dark"]` CSS rules. When dark mode is toggled, the page background changes but all card backgrounds, text colors, and borders remain light-mode values — creating an unreadable mess.

## Affected Pages

1. `frontend/drops.html`
2. `frontend/gamescript.html`
3. `frontend/seasonpace.html`
4. `frontend/snapefficiency.html`
5. `frontend/targetpremium.html`
6. `frontend/garbagetime.html`
7. `frontend/workload.html`
8. `frontend/successrate.html`

## Fix

Add standard dark mode override block to each page's `<style>` section. Follow the pattern from earlier pages (e.g., `aging.html`, `awards.html`):

```css
[data-theme="dark"] .page-container { background: var(--bg); color: var(--ink); }
[data-theme="dark"] .stat-card { background: var(--bg-card); border-color: var(--ink-faint); }
[data-theme="dark"] table th { color: var(--ink); }
[data-theme="dark"] table td { color: var(--ink-medium); }
```

## Acceptance Criteria

- All 8 pages are readable in dark mode
- Card backgrounds, text, borders use dark mode CSS variables
