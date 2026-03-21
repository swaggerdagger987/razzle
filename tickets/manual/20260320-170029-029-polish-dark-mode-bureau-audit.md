---
id: 20260320-170029-029
severity: P2
confidence: HIGH
flow: global
flow_name: Polish — Dark Mode Audit for Bureau Components
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Audit all Bureau components for dark mode (espresso flip) compatibility

**PRIORITY: P2** | **Type: structural**
**Page**: league-intel.html
**Design doc**: docs/DESIGN.md (Espresso Flip section)

The Bureau has many new components (odds grid, tab bar, position cards, agent headers, pro gate overlays) that need to work in dark mode. Conduct a visual audit of every Bureau component with dark mode toggled on. Verify that all backgrounds use the espresso palette, text is legible, borders are visible, position colors have sufficient contrast, and the pro gate blur still looks good against dark backgrounds.

### Task 1: Fix all dark mode issues in Bureau
**Accept when**: Every Bureau component renders correctly in dark mode: odds cards use espresso card background, text is cream/white for legibility, tab bar has appropriate dark styling, position color accents maintain contrast, agent headers are styled for dark, and pro gate overlays work on dark backgrounds. Verified by visual inspection at desktop and mobile widths. No white flashes or unstyled elements when toggling dark mode.
