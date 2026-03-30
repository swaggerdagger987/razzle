# DES-084: Interactive spans/tds in Lab missing role="button" and tabindex

**Priority**: P1
**Area**: frontend/lab.js (8+ interactive patterns)
**Cycle**: 8

## Problem

Multiple interactive elements in the Lab Screener are `<span>` or `<td>` elements with `onclick` handlers but no `role="button"`, no `tabindex="0"`, and no `aria-label`. Screen readers don't announce them as interactive, and keyboard users cannot reach them.

Affected patterns:

1. **Filter chip remove x** (line ~3203): `<span class="remove" onclick="removeFilter(i)">x</span>` — no role, no tabindex
2. **GP filter clear x** (line ~3196): `<span class="remove" onclick="clearMinGP()">x</span>`
3. **Team chip remove x** (line ~3362): `<span class="remove" onclick="removeTeam(...)">x</span>`
4. **Add column + header** (line ~1603): `<th onclick="openColumnPicker()">+</th>` — interactive th with no role
5. **DVS info icon** (line ~1583): `<span onclick="toggleDVSInfo()">i</span>` — no role, no tabindex
6. **Position count badges** (line ~3111): `<span onclick="togglePosition('QB')">QB:12</span>` — clickable filter, not keyboard accessible
7. **Star/watchlist td** (line ~1755): `<td onclick="...">` — toggle button with no role
8. **Pin td** (line ~1764): `<td onclick="togglePinPlayer(...)">` — same issue

These are core Screener interactions used constantly by power users.

## Fix

For each interactive span/td, add:
- `role="button"`
- `tabindex="0"`
- `aria-label="descriptive label"`

Example for filter chip remove:
```javascript
`<span class="remove" role="button" tabindex="0" aria-label="Remove filter" onclick="removeFilter(${i})">x</span>`
```

For star/pin columns, add `role="button"` and `aria-label` that includes the player name and current state.

## Design Rule

WCAG 2.1 SC 4.1.2: Name, Role, Value — interactive elements must expose their role to assistive technology. Dynasty power users are keyboard-heavy; these controls must be reachable via Tab.
