---
id: S2-073
severity: S2
confidence: HIGH
category: design
source: DQ-495
status: OPEN
---

# 8 newer standalone pages (Phases 131-140) have zero dark mode CSS overrides

## Root Cause (UPDATED 2026-03-29 — code investigation)

Investigation reveals a SPLIT picture:
- 6 of 8 pages DO have dark mode in `frontend/lab-panels.css:4903-4931` (table styles only)
- 2 of 8 pages have NO dark mode anywhere

### Pages WITH dark mode in lab-panels.css:
- `workload.html` — `.wl-table` at `lab-panels.css:4910`
- `snapefficiency.html` — `.se-table` at `lab-panels.css:4909`
- `dualthreat.html` — `.dt-table` at `lab-panels.css:4911`
- `targetpremium.html` — `.tp-table` at `lab-panels.css:4912`
- `garbagetime.html` — `.gt-table` at `lab-panels.css:4914`
- `seasonpace.html` — `.spc-table` at `lab-panels.css:4923`

### Pages with NO dark mode:
- `successrate.html` — missing from lab-panels.css entirely
- `gamescript.html` — missing from lab-panels.css entirely

### All 8 pages still lack inline `<style>` dark mode overrides:
- `drops.html` — `<style>` at lines 28-100, no `[data-theme="dark"]`
- `gamescript.html` — `<style>` at lines 28-100, no `[data-theme="dark"]`
- `seasonpace.html` — `<style>` at lines 28-80, no `[data-theme="dark"]`
- (etc.)

**Reference**: `frontend/aging.html` has proper `[data-theme="dark"]` block in its inline `<style>`

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
