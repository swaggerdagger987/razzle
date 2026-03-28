---
severity: S1
confidence: HIGH
category: ux-flow
source: human
audit_ref: "User feedback: Lab toolbar is cluttered and confusing"
---

# Overhaul Lab toolbar for clarity and usability

## What's Wrong

The Lab toolbar is a wall of controls crammed into one horizontal bar. New users don't know where to start. Five specific issues:

1. **Tools dropdown is comically tall** — `max-height: 80vh` makes it span 80% of the screen. It has ~25 buttons across 4 sections. Way too much.
2. **Preset label never updates** — You pick "Dynasty" preset, the dropdown resets to "Preset..." immediately. User has no idea which preset is active.
3. **No league type selector** — There's no way to switch between dynasty, redraft, keeper, best ball scoring contexts. This is fundamental for a fantasy tool.
4. **Search placeholder says "search play"** — Truncated on smaller screens, looks like "search play" instead of "search player". Should explicitly say "Search Player".
5. **Toolbar is visually dense** — Everything has equal visual weight. No hierarchy. The most-used controls (position filters, search, year) should be prominent; the less-used (columns, formulas, tools) should be secondary.

## Root Cause

**File**: `frontend/lab.html:3335-3441` (toolbar HTML)
**File**: `frontend/lab.html:633-748` (toolbar CSS)
**File**: `frontend/lab.js:3524-3542` (tools dropdown toggle)
**File**: `frontend/lab.js:3865-3900` (preset apply + immediate reset)

### Issue 1: Tools dropdown
- `lab.html:701` — `.tools-dropdown { max-height: 80vh }` is way too generous
- The dropdown has 4 sections (View, Export, Display, Analysis) with ~25 buttons
- Should be `max-height: 50vh` max, or better yet reorganized into a compact grid

### Issue 2: Preset label resets
- `lab.js:3888` — `sel.value = ""` resets the select immediately after applying
- Should keep the selected value so user sees which preset is active

### Issue 3: No league type
- No league format selector exists anywhere in the toolbar
- Need a select/toggle for: Dynasty, Redraft, Keeper, Best Ball
- This should affect which columns/presets are shown by default and potentially which stats are emphasized

### Issue 4: Search placeholder
- `lab.html:3347` — placeholder is `"search players..."` which truncates to `"search play"` on narrow viewports
- Change to `"Search Player"` (shorter, clearer, capitalized for visual weight)

### Issue 5: Toolbar density
- `lab.html:633` — `.toolbar { gap: 8px; flex-wrap: nowrap }` packs everything flat
- No visual grouping or hierarchy between primary controls (filters, search) and secondary controls (columns, formulas, tools)

## The Fix

### Files to modify:
1. `frontend/lab.html` — toolbar HTML structure + inline CSS
2. `frontend/lab.js` — preset apply logic, league type state, search placeholder

### Specific changes:

**1. Tools dropdown — compact it:**
- Change `max-height: 80vh` to `max-height: 50vh`
- Reduce padding in dropdown sections
- Consider a 2-column grid for the Display section (10 toggles → 2×5 grid)

**2. Preset label — keep selection visible:**
- In `applyPresetFromToolbar()`: remove `sel.value = ""` (line 3888)
- The select should show the active preset name after selection
- When user manually changes columns, reset to "Custom" or "Preset..." to indicate deviation

**3. League type selector — add it:**
- Add a `<select>` to the toolbar: Dynasty | Redraft | Keeper | Best Ball
- Store in `state.leagueType`
- When changed:
  - Dynasty: show dynasty-relevant columns by default (age, dynasty value, draft capital)
  - Redraft: show redraft-relevant columns (ADP, season projections, schedule)
  - Keeper: show keeper-relevant columns (contract value, years remaining)
  - Best Ball: show best ball columns (ceiling, boom rate, consistency)
- Save to URL state and localStorage

**4. Search placeholder — fix it:**
- Change placeholder to `"Search Player"` in lab.html
- Update dynamic placeholder in lab.js to: `"Search Player"` / `"Search Prospect"` / `"Search Player"` per universe

**5. Toolbar visual hierarchy — group it:**
- Primary row: Position chips + Search + Year + League Type
- Secondary row (or collapsible): Preset + Columns + Formulas + Filter + Tools
- Use a subtle background difference or separator to distinguish rows
- On mobile: primary row always visible, secondary behind a "More" toggle

## Acceptance Criteria

- [ ] Tools dropdown maxes at 50vh, not 80vh
- [ ] Selecting a preset keeps the label showing the preset name (not "Preset...")
- [ ] League type selector exists with at least Dynasty and Redraft options
- [ ] Search input says "Search Player" (not "search play" or "search players...")
- [ ] Toolbar has clear visual separation between primary and secondary controls
- [ ] All changes work in dark mode
- [ ] Mobile (390px): toolbar doesn't overflow, all controls accessible

## Context

This is user-reported feedback from the founder looking at the live site. These are the first things a new user sees when they open The Lab. Getting this right is critical for the "would a Reddit user screenshot this" test.
