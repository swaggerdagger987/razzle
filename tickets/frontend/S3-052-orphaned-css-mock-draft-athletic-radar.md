---
id: S3-052
severity: S3
category: frontend
finding_ref: FUNC-054
confidence: HIGH
---

# S3-052: Orphaned CSS for mock-draft and athletic-radar panels

## Root Cause

`frontend/lab-panels.css:3799` -- CSS block header "MOCK DRAFT PANEL"
`frontend/lab-panels.css:4303` -- CSS block header "PROSPECT ATHLETIC RADAR PANEL"

These CSS sections define styles for panels that have no corresponding:
- Panel definition in `lab-panels.js` (no `defs.push` for mock-draft or athletic-radar)
- Sidebar item in `lab.html` (no `data-panel` referencing these names)
- API endpoint in `backend/server.py`

The CSS is dead code from a planned but unbuilt feature. It adds to the
CSS file size without any user-facing effect.

## What to Fix

Either:
1. **Remove** the orphaned CSS blocks if the panels are not planned for near-term
2. **Build** the panel definitions if these features are on the roadmap

Decision depends on product roadmap. If neither panel is planned, delete
the CSS. If planned, leave as-is and ticket the panel implementation separately.

## Files to Change

- `frontend/lab-panels.css` -- remove or annotate orphaned CSS blocks

## Acceptance Criteria

- [ ] No CSS exists for panels that have no JS definition
- [ ] OR: CSS is annotated with "planned" comment if feature is on roadmap

## Do NOT

- Do not build the full panel implementation in this ticket
