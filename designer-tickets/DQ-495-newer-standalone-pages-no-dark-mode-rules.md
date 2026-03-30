---
id: DQ-495
title: 8 newer standalone panel pages have zero dark mode CSS overrides
severity: P3
status: open
component: Standalone Pages
phase: Phases 131-140
---

## Problem

Eight panel pages built in Phases 131-140 have zero `[data-theme="dark"]` CSS rules in their embedded stylesheets. They rely entirely on CSS variable cascade, which works for basic colors but misses:

1. Card headers using `color: var(--bg)` — in dark mode this becomes dark espresso on green/red backgrounds (poor contrast)
2. Hardcoded `rgba(217,119,87,0.08)` hover (drops.html) doesn't adapt to dark mode
3. No higher-opacity hover tint for dark backgrounds (lab-panels.css applies its own dark overrides separately)

These pages redirect to the Lab at top level, but are indexed by search engines and briefly visible before redirect.

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

Add dark mode overrides for card headers and hover states in each page's `<style>` block:

```css
[data-theme="dark"] .XX-card-header { color: var(--bg-card); }
[data-theme="dark"] .XX-table tbody tr:hover { background: rgba(217, 119, 87, 0.18); }
```

## Acceptance Criteria

- [ ] All 8 pages have `[data-theme="dark"]` rules
- [ ] Card header text is legible on dark backgrounds
- [ ] Hover tint is visible in dark mode
