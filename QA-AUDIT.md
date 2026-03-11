# QA + UX Audit — Phases 106-110

**Audit Date**: 2026-03-11
**Scope**: Phases 106-110 (Bulk bar badges, J/K navigation, Auto-restore, Smooth scroll, QA fixes)
**Files Audited**: frontend/lab.js, frontend/lab.html

---

## QA FINDINGS

### CRITICAL: None

### HIGH

1. **Enter key missing preventDefault when opening profile** (`frontend/lab.js:9078-9083`)
   - When a row is focused and Enter is pressed, `openPlayerProfile()` fires but `e.preventDefault()` is not called. If a button or link elsewhere on the page has native focus, the Enter event could trigger both the profile open AND the native element's click. Should call `e.preventDefault()` when actually opening a profile.

### MEDIUM

2. **Row focus ring too thin for design system** (`frontend/lab.html:1095-1098`)
   - `box-shadow: inset 0 0 0 1.5px var(--pos-qb)` uses 1.5px — design guide specifies 3px solid borders. The focus ring should be 2px minimum for consistency and accessibility visibility.

3. **Auto-restore doesn't persist active filters** (`frontend/lab.js:2868-2879`)
   - `razzle_last_state` saves universe, columns, sort, season, position, limit — but does NOT save `state.filters` (active screener filters). A returning user gets their column layout back but loses any custom filters they had applied. Filters are arguably the most important state to restore.

### LOW

4. **Rapid pagination queues multiple smooth scrolls** (`frontend/lab.js:2332-2340`)
   - Fast arrow key presses queue multiple `_scrollTableTop()` calls via requestAnimationFrame. Each scroll animation fights the previous one. Not harmful but produces jittery animation. Could debounce or use `scrollTo({behavior: "instant"})` for rapid presses.

5. **J/K querySelectorAll on every keypress** (`frontend/lab.js:9064`)
   - `tbody.querySelectorAll("tr[data-player-id]")` runs a DOM query on every J/K press. For <200 rows this is negligible, but could cache the NodeList after render if optimization is ever needed.

---

## UX FINDINGS

### CRITICAL: None

### HIGH: None

### MEDIUM

1. **No discoverability hint for keyboard navigation** (general UX)
   - J/K row navigation, Enter to open profile, and arrow key pagination are powerful features but completely invisible. A first-time user has no way to discover these without pressing `?`. Consider a subtle "Tip: press ? for keyboard shortcuts" hint that appears once and can be dismissed. This would increase feature adoption significantly among power users.

2. **Auto-restore filter gap** (relates to QA finding #3)
   - When a user returns to the Lab, columns and sort are restored but filters are not. This creates a confusing state where the table looks like their last session but shows different data. Either restore filters too, or don't restore at all — the partial restore is worse than no restore for user mental model.

### LOW

3. **Position badge spacing in bulk bar** (`frontend/lab.js:3434`)
   - Uses `&nbsp;` between "selected" text and position badges. This is adequate but could use a CSS gap for more consistent spacing across browsers.

4. **Focus ring color always blue regardless of position** (`frontend/lab.html:1096`)
   - The row focus ring always uses `var(--pos-qb)` (blue) even when filtering by RB/WR/TE. Could match position filter color, but current behavior is acceptable since blue reads as "selection" universally.

---

## SUMMARY

- **CRITICAL**: 0
- **HIGH**: 1 (Enter preventDefault)
- **MEDIUM**: 4 (focus ring thickness, filter restore gap, discoverability, UX filter gap)
- **LOW**: 4 (scroll debounce, DOM query cache, badge spacing, focus color)

Previous audit (Phase 110) fixed 2 HIGH issues (column validation + scroll timing). This audit finds 1 new HIGH and 4 MEDIUM items. Code quality is solid overall.
