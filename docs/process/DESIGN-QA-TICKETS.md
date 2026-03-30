# Design QA Tickets — 2026-03-25 (v6)

Audit method: full codebase scan of all frontend files (CSS, JS, HTML) against `docs/DESIGN.md`.

---

## DES-400: Gradient in prompts.html violates "NO gradients" rule

**Severity**: HIGH
**File**: `frontend/prompts.html:78`
**Violation**: DESIGN.md explicitly says "NO gradients" under the Don't list.

**BEFORE**:
```css
background: linear-gradient(transparent, var(--bg)); pointer-events: none;
```

**AFTER**: Replace with a solid `var(--bg)` with partial opacity, or remove the fade overlay entirely:
```css
background: var(--bg); opacity: 0.9; pointer-events: none;
```

---

## DES-401: Cold black rgba(0,0,0) in agents.html — should be espresso

**Severity**: HIGH
**Files**: `frontend/agents.html:39,259,285`
**Violation**: DESIGN.md says "always use espresso brown (#2d1f14), never navy/charcoal/gray." Pure black (0,0,0) is cold, not warm espresso.

**BEFORE**:
```css
/* Line 39 */  filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.15));
/* Line 259 */ box-shadow: 4px 4px 0 rgba(0,0,0,0.4);
/* Line 285 */ filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3));
```

**AFTER**: Use espresso ink `rgba(45,31,20,...)` or `var(--ink)`:
```css
/* Line 39 */  filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));
/* Line 259 */ box-shadow: 4px 4px 0 var(--ink);
/* Line 285 */ filter: drop-shadow(2px 2px 0 rgba(45,31,20,0.3));
```

---

## DES-402: Cold black rgba(0,0,0) in lab.html overlays

**Severity**: MEDIUM
**Files**: `frontend/lab.html:908,960,1046`
**Violation**: Modal overlays and dropdown shadows use cold black instead of warm espresso.

**BEFORE**:
```css
/* Line 908 */  [data-theme="dark"] .filter-modal-overlay { background: rgba(0,0,0,0.5); }
/* Line 960 */  [data-theme="dark"] .column-picker-overlay { background: rgba(0,0,0,0.5); }
/* Line 1046 */ box-shadow: 0 4px 8px rgba(0,0,0,0.25);
```

**AFTER**:
```css
/* Line 908 */  [data-theme="dark"] .filter-modal-overlay { background: rgba(26,17,10,0.6); }
/* Line 960 */  [data-theme="dark"] .column-picker-overlay { background: rgba(26,17,10,0.6); }
/* Line 1046 */ box-shadow: 0 4px 8px rgba(45,31,20,0.25);
```
Note: Uses `--bg-ink` RGB (26,17,10) for dark overlays, `--ink` RGB (45,31,20) for shadows.

---

## DES-403: Hardcoded #fff white in lab.js banner

**Severity**: MEDIUM
**File**: `frontend/lab.js:1185`
**Violation**: Hardcoded `#fff` won't respond to theme changes. Should use the design system's text-on-accent token.

**BEFORE**:
```js
banner.style.cssText = "background:var(--orange);color:#fff;text-align:center;..."
```

**AFTER**:
```js
banner.style.cssText = "background:var(--orange);color:var(--text-on-accent);text-align:center;..."
```

---

## DES-404: Hardcoded #fff in lab-panels.js canvas correlation heatmap

**Severity**: MEDIUM
**File**: `frontend/lab-panels.js:9833`
**Violation**: Canvas text uses hardcoded `#fff` instead of theme-aware white. Won't adapt to dark mode.

**BEFORE**:
```js
ctx.fillStyle = Math.abs(r) > 0.5 ? '#fff' : t.ink;
```

**AFTER**:
```js
ctx.fillStyle = Math.abs(r) > 0.5 ? t.white : t.ink;
```
The `t` object (from `getCanvasTheme()`) already has a `white` property that's theme-aware.

---

## DES-405: Off-token border-radius 14px (should be 12px or 20px)

**Severity**: MEDIUM
**Files**:
- `frontend/archetypes.html:115` — 14px
- `frontend/dashboard.html:113` — 14px
- `frontend/lab-panels.css:411` — 14px
- `frontend/tiers.html:120` — 14px
- `frontend/pricing.html:41` — 13px

**Violation**: DESIGN.md defines three radius tokens: `--radius-sm` (8px), `--radius` (12px), `--radius-lg` (20px). Values of 13px and 14px fall between tokens and create visual inconsistency.

**AFTER**: Replace all 14px with `var(--radius)` (12px) or `var(--radius-lg)` (20px) depending on element type. For pill-shaped toggles (pricing.html), use `var(--radius-lg)`. For card-like elements (archetypes, dashboard, tiers), use `var(--radius)`.

---

## DES-406: Sticker chip hover shadow is 5px, should be 6px

**Severity**: LOW
**File**: `frontend/styles.css:1697,1701`
**Violation**: DESIGN.md specifies hover-lift as `6px 6px 0 + translate(-2px, -2px)`. Sticker chips use `5px 5px 0` instead.

**BEFORE**:
```css
.sticker-chip:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--ink);     /* Line 1697 */
}
.sticker-chip--rotated:hover {
  transform: rotate(-3deg) translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--ink);     /* Line 1701 */
}
```

**AFTER**:
```css
.sticker-chip:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}
.sticker-chip--rotated:hover {
  transform: rotate(-3deg) translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}
```

---

## DES-407: card-hero uses non-standard 5px default shadow

**Severity**: LOW
**File**: `frontend/styles.css:849`
**Violation**: The standard card shadow is `4px 4px 0`. `card-hero` uses `5px 5px 0` as its resting state, which is between the standard (4px) and hover-lift (6px) sizes, muddying the visual hierarchy.

**BEFORE**:
```css
.card-hero {
  border-width: 3px;
  box-shadow: 5px 5px 0 var(--ink);
}
```

**AFTER**: Either keep 4px standard and let hover go to 6px, or go bold with 6px resting + 8px hover:
```css
.card-hero {
  border-width: 3px;
  box-shadow: 4px 4px 0 var(--ink);
}
```

---

## DES-408: text-shadow uses hardcoded rgba instead of CSS var

**Severity**: LOW
**Files**:
- `frontend/lab-panels.css:430` — `text-shadow: 2px 2px 0 rgba(45,31,20,0.2);`
- `frontend/fptsbreakdown.html:215` — `text-shadow: 0 0 2px rgba(45,31,20,0.5);`
- `frontend/percentiles.html:226` — `text-shadow: 0 1px 2px rgba(45,31,20,0.3);`
- `frontend/tiers.html:146` — `text-shadow: 2px 2px 0 rgba(45,31,20,0.2);`

**Violation**: While these use the correct espresso RGB values, they're hardcoded and won't respond to dark mode theme changes. In dark mode, espresso text-shadow on espresso background is invisible.

**AFTER**: Define a `--shadow-text` CSS variable that flips in dark mode, or use the existing `--ink` with alpha channel support.

---

## DES-409: drop-shadow on index.html and about.html uses hardcoded rgba

**Severity**: LOW
**Files**:
- `frontend/index.html:77` — `filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));`
- `frontend/about.html:47` — `filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));`

**Violation**: Same pattern as DES-408 — correct espresso RGB but hardcoded. Won't adapt when dark mode flips ink to sand.

**AFTER**: Define a reusable `--shadow-drop` CSS variable that flips in dark mode:
```css
:root { --shadow-drop: rgba(45,31,20,0.15); }
[data-theme="dark"] { --shadow-drop: rgba(237,224,207,0.15); }
```
Then use:
```css
filter: drop-shadow(3px 3px 0 var(--shadow-drop));
```

---

## Summary

| Ticket  | Severity | Category              | Files Affected |
|---------|----------|-----------------------|----------------|
| DES-400 | HIGH     | Gradient violation    | 1              |
| DES-401 | HIGH     | Cold black colors     | 1 (3 lines)    |
| DES-402 | MEDIUM   | Cold black overlays   | 1 (3 lines)    |
| DES-403 | MEDIUM   | Hardcoded white in JS | 1              |
| DES-404 | MEDIUM   | Hardcoded white in canvas | 1          |
| DES-405 | MEDIUM   | Off-token radius      | 5 files        |
| DES-406 | LOW      | Hover shadow size     | 1 (2 lines)    |
| DES-407 | LOW      | Non-standard shadow   | 1              |
| DES-408 | LOW      | Hardcoded text-shadow | 4 files        |
| DES-409 | LOW      | Hardcoded drop-shadow | 2 files        |
