# Design QA Tickets — 2026-03-25 (v3)

Audit of razzle.lol frontend against `docs/DESIGN.md`. 10 tickets ordered by severity.
Method: Full codebase walk — CSS, HTML, JS (styles.css, lab-panels.css, lab.js, charts.js, warroom.js, app.js, agent-config.js, formulas.js, player.js, lab-panels.js + 10 HTML pages).

---

## TICKET 1: Warroom pixel palette uses 30+ cold grays instead of warm espresso tones
**Severity**: HIGH
**File**: `frontend/warroom.js` lines 35-86
**Violation**: DESIGN.md says "Never blue-black ink" and "No cold grays anywhere — even dark mode stays warm (brown, not gray)."

The Situation Room pixel palette object hardcodes 30+ cold gray hex values: `#222222`, `#333333`, `#444444`, `#555555`, `#666666`, `#888888`, `#999999`, `#aaaaaa`, `#cccccc`, `#dddddd`. These are used for furniture sprites, speech bubbles, UI chrome, and pixel art throughout the canvas.

**Expected**: All grays should be warm-shifted to the espresso brown family (`--ink`, `--ink-medium`, `--ink-light`, `--ink-faint`) or warm equivalents like `#3b2821`, `#5c4a3d`, `#8a7565`, `#c4b5a5`. The pixel engine's entire palette needs a warm-shift pass.

**Instances**: ~38 hardcoded cold gray hex values in warroom.js alone.

---

## TICKET 2: Canvas chart colors hardcoded — dark mode breaks for all canvas features
**Severity**: HIGH
**Files**: `frontend/charts.js`, `frontend/lab.js`, `frontend/lab-panels.js`
**Violation**: DESIGN.md says "Dark mode available site-wide via toggle. CSS variables handle the rest."

Canvas drawing operations (`ctx.fillStyle`, `ctx.strokeStyle`) use hardcoded hex values like `"#d97757"`, `"#5b7fff"`, `"#2ec4b6"`, `"#e63946"` directly instead of reading CSS variables via `getComputedStyle`. When dark mode flips the CSS variables, canvas elements (career arc, sparklines, radar charts, scatter plots, bar charts) do not respond.

**Key locations**:
- `charts.js` lines 3, 379, 387, 450, 491, 533, 549, 561 — CHART_COLORS array + stroke/fill calls
- `lab.js` lines 9605, 9977, 12797-12917, 13002-13101 — boom/bust charts, trend lines
- `lab-panels.js` lines 4951, 7268, 9956, 10083 — panel canvases

**Expected**: All canvas color values should be read from CSS variables at render time via `getComputedStyle(document.documentElement).getPropertyValue('--orange')` or the existing `getCanvasTheme()` helper.

**Instances**: ~50 hardcoded hex values across 3 files.

---

## TICKET 3: Undocumented chart color palette introduces off-brand colors
**Severity**: HIGH
**Files**: `frontend/lab.js` lines 9707-9708, `frontend/agent-config.js`
**Violation**: DESIGN.md says "More than one accent color per component" is forbidden, and all colors must be from the approved palette.

Two color arrays define 11-color palettes for multi-series charts that include colors NOT in DESIGN.md: `#e87422` (burnt orange, not `--orange`), `#4a9e5c` (forest green, not `--green`), `#c44daa` (magenta, not in palette at all), `#d44040` (dark red, not `--red`).

Agent config (`agent-config.js` line 94) also uses `#e87422` for The Fox agent.

**Expected**: All chart and agent colors should come from the DESIGN.md palette. If more than 5 series colors are needed, use light tint variants (`--orange-light`, `--green-light`, etc.) not invented colors.

---

## TICKET 4: Agent colors defined in two places — single source of truth missing
**Severity**: MEDIUM
**Files**: `frontend/agent-config.js` lines 10-150, `frontend/warroom.js` lines 719-729 + 3079-3099
**Violation**: Design consistency — agent colors hardcoded in two separate files with potential for drift.

Agent persona colors are hardcoded as hex strings in both `agent-config.js` (6 agents, lines 10-150) and `warroom.js` (pixel engine agent definitions lines 719-729, plus bio card definitions lines 3079-3099). Any color change requires updating 3 locations.

**Expected**: Single source of truth for agent colors. Define in CSS variables (`--agent-razzle`, `--agent-dolphin`, etc.) or in one JS config object imported by both files.

---

## TICKET 5: 15 inline `border-bottom:1px` dividers violate "no thin borders" rule
**Severity**: MEDIUM
**Files**: `frontend/charts.js`, `frontend/lab.js`, `frontend/player.js`, `frontend/formulas.js`, `frontend/lab-panels.js`
**Violation**: DESIGN.md says "No thin 1px borders" and "Secondary border: 2px solid."

Inline styles on `<tr>` and `<div>` elements use `border-bottom:1px solid var(--ink-faint)` as row separators in:
- `charts.js` lines 904, 908, 1270, 1274, 1295, 1304, 1312, 1316 (8 instances)
- `lab.js` lines 2401, 2417, 9275, 10808 (4 instances)
- `formulas.js` line 134
- `player.js` line 749
- `lab-panels.js` line 10196

**Expected**: Replace `1px` with `2px` on all dividers. Use `2px dashed var(--ink-faint)` for internal card dividers per DESIGN.md "Dashed dividers" rule.

---

## TICKET 6: 16 off-token border-radius values (3px, 4px, 6px) in inline JS styles
**Severity**: MEDIUM
**Files**: `frontend/charts.js`, `frontend/formulas.js`, `frontend/warroom.js`, `frontend/lab.js`, `frontend/lab-panels.js`
**Violation**: DESIGN.md defines three radius tokens: `--radius-sm: 8px`, `--radius: 12px`, `--radius-lg: 20px`. "Use the token, not a hardcoded value."

Inline styles use non-token values:
- `border-radius:4px` — 6 instances (position badges in charts.js, formulas.js, lab-panels.js)
- `border-radius:3px` — 5 instances (LEADER badge in warroom.js, progress bars in lab-panels.js)
- `border-radius:6px` — 5 instances (bar fill, container cards in lab.js, lab-panels.js)

**Expected**: Map to nearest token — `3px`/`4px`/`6px` should all become `var(--radius-sm)` (8px). Inline styles should reference the CSS variable.

---

## TICKET 7: `getCanvasTheme()` in app.js has redundant hardcoded fallback block
**Severity**: LOW
**File**: `frontend/app.js` lines 100-115
**Violation**: DRY principle / maintainability. Lines 100-107 hardcode the entire color palette as an if/else ternary, but lines 110-115 already read from `getComputedStyle` — making the fallback dead code that can drift from CSS.

```js
// Lines 100-107: hardcoded (redundant)
bg: isDark ? "#2d1f14" : "#ede0cf",
bgWarm: isDark ? "#3b2821" : "#e5d5c3", ...

// Lines 110-115: reads CSS vars (correct approach)
const s = getComputedStyle(document.documentElement);
```

**Expected**: Remove the hardcoded fallback block. Use only the `getComputedStyle` path. If a CSS-before-paint race is a concern, defer canvas draws to `DOMContentLoaded` rather than maintaining a parallel color definition.

---

## TICKET 8: Position color objects duplicated across 4+ JS files
**Severity**: LOW
**Files**: `frontend/lab.js` ~line 9544, `frontend/charts.js` line 3, `frontend/lab-panels.js`, `frontend/warroom.js`
**Violation**: Design system consistency — position colors (`QB:#5b7fff, RB:#2ec4b6, WR:#d97757, TE:#8b5cf6`) are copy-pasted as object literals in 4+ JavaScript files.

Example from `lab.js`:
```js
const _acPosColors = { QB: "#5b7fff", RB: "#2ec4b6", WR: "#d97757", TE: "#8b5cf6" };
```

This same object appears in `charts.js`, `lab-panels.js`, and `warroom.js` with varying names.

**Expected**: Define position colors once — either as CSS variables read via `getComputedStyle` (preferred, enables dark mode), or as a single exported constant in `app.js` that all files reference.

---

## TICKET 9: Warroom speech bubble and canvas UI uses pure `#000` and `#fff`
**Severity**: LOW
**File**: `frontend/warroom.js` lines 427, 934, 987
**Violation**: DESIGN.md says ink is `--ink` (`#2d1f14`), not black. Card background is `--bg-card`, not white.

Speech bubbles use `#fff` for background and `#000`/`#333` for text. In the Razzle design system, "white" should be `--bg-card` (`#f7efe5`) and "black" should be `--ink` (`#2d1f14`). Using pure black/white breaks the warm sand/espresso aesthetic.

**Expected**: Replace `#fff` with the cream value from `--bg-card` and `#000` with the espresso value from `--ink`. For the pixel art canvas, read these values from CSS vars or the `getCanvasTheme()` helper.

---

## TICKET 10: Inline styles dominate JS-rendered components — root cause of tickets 5, 6, 8
**Severity**: LOW (systemic / tech debt)
**Files**: `frontend/lab.js`, `frontend/charts.js`, `frontend/lab-panels.js`, `frontend/player.js`, `frontend/formulas.js`
**Violation**: Design maintainability. Hundreds of `style="..."` attributes in innerHTML strings embed design decisions (colors, spacing, fonts, borders, radii) directly in JavaScript, making them invisible to CSS-level changes and dark mode toggles.

Examples:
- `lab.js` line 4589: 140+ character inline style for search result cards
- `charts.js` line 891: position badge styling inline
- `lab.js` line 10204: modal container styling inline
- `lab.js` line 10313: tier badge styling inline

**Expected**: Extract repeated inline style patterns into CSS classes in `styles.css` or `lab-panels.css`. This would:
1. Make dark mode automatic (CSS vars resolve correctly in stylesheets)
2. Reduce JS bundle size
3. Make design changes possible from one CSS edit instead of find-and-replace across JS
4. Allow the design system tokens to propagate

This is the root cause behind tickets 5, 6, and 8.

---

## Summary

| # | Ticket | Severity | Instances | Root Cause |
|---|--------|----------|-----------|------------|
| 1 | Warroom cold grays | HIGH | ~38 | Pixel palette not warm-shifted |
| 2 | Canvas ignores dark mode | HIGH | ~50 | Hardcoded hex in ctx calls |
| 3 | Off-brand chart colors | HIGH | ~6 | Undocumented palette |
| 4 | Agent colors in 2 places | MEDIUM | 18 | No single source of truth |
| 5 | 1px thin borders | MEDIUM | 15 | Inline styles bypass design tokens |
| 6 | Off-token border-radius | MEDIUM | 16 | Inline styles bypass design tokens |
| 7 | Redundant getCanvasTheme | LOW | 1 | Dead code / drift risk |
| 8 | Position colors duplicated | LOW | 4+ files | No shared constant |
| 9 | Pure black/white in warroom | LOW | ~5 | Should be espresso/cream |
| 10 | Inline styles in JS | LOW | 100s | Systemic tech debt |

**Total design violations**: ~150 instances across 7 files.

**What's clean**: CSS files (`styles.css`, `lab-panels.css`) are fully compliant. No gradients anywhere. No wrong font families. No "Loading..." text (all themed). HTML pages use correct structure. The design system is well-defined — the violations are all in JavaScript-rendered content that bypasses it.

**Highest-impact fix**: Create a centralized theme-aware color helper and migrate canvas operations to use it (fixes tickets 1, 2, 3, 7, 8, 9 in one pass).
