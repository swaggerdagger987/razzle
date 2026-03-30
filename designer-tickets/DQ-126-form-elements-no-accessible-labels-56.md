# DQ-126: 56 form elements without aria-label or <label> — WCAG Level A gap

**Priority**: P2 — MEDIUM
**Category**: Accessibility
**Scope**: 75 HTML files

## Problem

56 form elements (`<input>`, `<select>`, `<textarea>`) have no associated `<label>` element and no `aria-label` attribute. Screen readers announce these as unlabeled controls. This violates WCAG 2.1 Success Criterion 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value), both Level A.

## Examples of unlabeled elements

- auction.html: `<input type="range" id="budget-slider">` — no label
- auction.html: `<input type="number" id="roster-input">` — no label
- cheatsheet.html: `<select class="cs-season-select" id="season-select">` — no label
- Multiple standalone pages: season/position `<select>` dropdowns with no aria-label

## Properly labeled examples (use as model)

- advantage.html: `<select id="paSeason" aria-label="Season">`
- agents.html: `<input id="cfgSharedKey" aria-label="API key for all agents">`
- career.html: `<input aria-label="Search for a player" role="combobox">`

## Fix

For each unlabeled form element, add `aria-label="descriptive text"`. The label should describe what the control does, not its type:
- Budget slider: `aria-label="Budget amount"`
- Season select: `aria-label="Season"`
- Position filter: `aria-label="Filter by position"`

Mechanical: grep all HTML files for `<input`, `<select`, `<textarea` without `aria-label`. Add labels. ~56 instances across ~20 files.
