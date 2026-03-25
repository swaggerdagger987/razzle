# Design QA Tickets — 2026-03-25 (v2)

Audit method: Code-based CSS/HTML/JS audit against `docs/DESIGN.md`.
Live site: Render returning 502 at time of audit; ran against local dev server.

---

## TICKET 1 — HIGH: warroom.js has ~40 hardcoded cold gray hex values

**Rule violated**: "Cold grays anywhere — even dark mode stays warm (brown, not gray)"

**File**: `frontend/warroom.js`

**Evidence**: 39 cold gray shorthand values (`#333`, `#444`, `#555`, `#666`, `#888`, `#999`, `#aaa`, `#ccc`, `#ddd`) used in the pixel engine palette, furniture sprites, bubbles, debug indicators. These are the only cold grays in the entire frontend — the rest of the codebase is clean.

**Fix**: Create a `PIXEL_PALETTE` object at top of file mapping each cold gray to a warm espresso equivalent:
- `#333` -> `#3b2821`, `#444` -> `#4a3728`, `#555` -> `#5c4a3d`, `#666` -> `#6b5a4e`
- `#888` -> `#8a7565`, `#999` -> `#a08878`, `#aaa` -> `#b0a090`, `#ccc` -> `#c4b5a5`, `#ddd` -> `#d5c8b8`

**Severity**: HIGH — 39 brand violations in a single file. Situation Room canvas will look cold/out-of-place.

---

## TICKET 2 — HIGH: Noscript fallback blocks use hardcoded colors (dark mode broken)

**Rule violated**: Colors must use CSS variables to flip in dark mode.

**Files**:
- `agents.html:1604,1607`
- `lab.html:3155,3158`
- `league-intel.html:2535,2538`

**Evidence**: Inline `color:#6b5a4e` and `color:#a89585` — neither is a design token. They won't flip in dark mode, causing dark-text-on-dark-background for noscript users.

**Fix**: Add `.noscript-msg` and `.noscript-sub` classes in `styles.css`:
```css
.noscript-msg { color: var(--ink-medium); font-family: var(--font-mono); }
.noscript-sub { color: var(--ink-light); font-family: var(--font-hand); }
```
Replace all 6 inline style blocks.

**Severity**: HIGH — dark mode breakage + off-palette colors on 3 core pages.

---

## TICKET 3 — MEDIUM: 25+ panel cards missing hover-lift effect

**Rule violated**: "Hover lift — interaction should feel physical" (DESIGN.md Do section)

**File**: `frontend/lab-panels.css`

Only 5 of 30+ card classes have `:hover` styles (`.rankings-card`, `.breakout-card`, `.buysell-card`, `.scarcity-summary-card`, `.scarcity-card`).

Missing hover on: `.pa-card`, `.ww-card`, `.hc-card`, `.se-card`, `.wl-card`, `.dt-card`, `.tp-card`, `.dr-card`, `.gt-card`, `.sk-card`, `.mv-card`, `.po-card`, `.ag-card`, `.pt-card`, `.spc-card`, `.cst-player-card`, `.sw2-player-card`, `.fpb-card`, `.glo-player-card`, and 6+ more.

**Fix**: Add `transition: transform 0.15s, box-shadow 0.15s;` to each card base rule, and a shared hover pattern:
```css
.pa-card:hover, .ww-card:hover, .hc-card:hover /* ... */ {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}
```

**Severity**: MEDIUM — 25+ panels feel flat/static vs. the 5 that lift.

---

## TICKET 4 — MEDIUM: 30+ non-standard border-radius values in lab-panels.css

**Rule violated**: "Use the token, not a hardcoded value" — tokens are 8px, 12px, 20px.

**File**: `frontend/lab-panels.css`

**Evidence**: 7 different non-token values used for bars:
- 1px (line 2487), 2px (6 instances), 3px (5 instances), 4px (12 instances), 5px (1), 6px (4), 7px (2)
- Plus `14px` on `.tl-outer-card` (line 411) — should be `var(--radius)` (12px)

**Fix**: Standardize bars to two tiers: `2px` for micro-bars (<10px height), `4px` for regular bars. Consider `--radius-bar: 4px` token. Fix `.tl-outer-card` to `var(--radius)`.

**Severity**: MEDIUM — cumulative visual inconsistency across 30+ elements.

---

## TICKET 5 — MEDIUM: 25+ inline badges use 1px vertical padding (cramped)

**Rule violated**: Badges should feel chunky and sticker-like, not cramped.

**Files**: `frontend/lab.js` (13 instances), `charts.js`, `formula-store.js`, `league-intel.html`, `warroom.js`

**Evidence**: Pattern `padding:1px 5px` or `padding:1px 6px` repeated 25+ times in inline badge styles across JS template literals.

**Fix**: Change `padding:1px Xpx` -> `padding:2px Xpx`. Better: extract a `.badge-inline` CSS utility class to replace 25+ identical inline style strings.

**Severity**: MEDIUM — badges feel thin/cramped instead of chunky-sticker.

---

## TICKET 6 — MEDIUM: Hardcoded medal/rank colors not using CSS variables

**Rule violated**: Colors should use CSS variables for dark mode support.

**File**: `frontend/lab-panels.css`
- Line 603: `.tv-rank.top1 { color: #b8860b; }` (dark goldenrod — no CSS var)
- Line 605: `.tv-rank.top3 { color: #a0522d; }` (sienna — no CSS var)

While `--medal-gold` and `--medal-bronze` exist in `:root`, these rank text colors use different shades that aren't tokenized and won't adapt to dark mode.

**Fix**: Add `--rank-gold: #b8860b` and `--rank-bronze: #a0522d` to `:root` with dark mode overrides in `[data-theme="dark"]`.

**Severity**: MEDIUM — rank colors invisible or low-contrast in dark mode.

---

## TICKET 7 — MEDIUM: JS files use hardcoded border-radius in inline styles

**Rule violated**: "Use the token, not a hardcoded value."

**Files**:
- `lab-panels.js:9577,9579,9580,9600,9646` — `border-radius:3px` and `6px`
- `charts.js:891,1259` — `border-radius:4px`
- `formulas.js:132,273` — `border-radius:4px`
- `league-intel.html:2881,3028,3073,3123` — `border-radius:6px` and `4px` in JS template literals

~14 instances total.

**Fix**: Replace hardcoded values with `var(--radius-sm)` in inline style strings. CSS variables work in inline styles: `style="border-radius:var(--radius-sm)"`.

**Severity**: MEDIUM — inconsistent with the CSS-variable-based design system.

---

## TICKET 8 — LOW: matchups.html hardcodes `#fff` instead of CSS variable

**Rule violated**: White text on accent should use `var(--text-on-accent)`.

**File**: `frontend/matchups.html:643`
```js
var textColor = (bg === redVal || bg === greenVal) ? '#fff' : 'var(--ink)';
```

**Fix**: Change `'#fff'` to `'var(--text-on-accent)'`. The variable exists for exactly this purpose and properly handles dark mode.

**Severity**: LOW — works in light mode, minor dark mode contrast drift.

---

## TICKET 9 — LOW: research-sprawl.svg uses system fonts

**Rule violated**: Only Luckiest Guy, Space Mono, and Caveat are approved fonts.

**File**: `frontend/assets/research-sprawl.svg`
- Uses `font-family="system-ui, -apple-system, sans-serif"` — no Razzle font at all.

Other SVGs (`og-image.svg`, `og-image-lab.svg`) correctly use `'Luckiest Guy', 'Impact', sans-serif`.

**Fix**: Change to `font-family="'Space Mono', monospace"` or `"'Luckiest Guy', cursive"`.

**Severity**: LOW — SVG is decorative, not heavily visible.

---

## TICKET 10 — LOW: league-intel.html duplicates inline badge styles 6+ times

**Rule violated**: DRY / maintainability. Same badge pattern repeated in JS template literals.

**File**: `frontend/league-intel.html` — lines 2881, 3028, 3039, 3073, 3123, 4389

All use the same ~120-char inline style string for "YOU" badges.

**Fix**: Add `.badge-you` class in styles.css:
```css
.badge-you {
  font-family: var(--font-mono);
  font-size: 9px;
  background: var(--orange);
  color: var(--text-on-accent);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}
```
Replace 6 inline style blocks with `class="badge-you"`.

**Severity**: LOW — functional, just hard to maintain.

---

## Summary

| # | Sev | File(s) | Issue | Count |
|---|-----|---------|-------|-------|
| 1 | HIGH | warroom.js | Cold gray hex values in pixel engine | ~39 |
| 2 | HIGH | 3 HTML files | Noscript hardcoded colors, dark mode broken | 6 |
| 3 | MED | lab-panels.css | 25+ panel cards missing hover-lift | ~25 |
| 4 | MED | lab-panels.css | Non-standard border-radius (1-7px, 14px) | ~30 |
| 5 | MED | lab.js + 4 others | 1px badge padding (cramped) | ~25 |
| 6 | MED | lab-panels.css | Hardcoded medal/rank colors, no dark mode | 2 |
| 7 | MED | JS files | Hardcoded border-radius in inline styles | ~14 |
| 8 | LOW | matchups.html | #fff instead of var(--text-on-accent) | 1 |
| 9 | LOW | SVG assets | System font in research-sprawl.svg | 1 |
| 10 | LOW | league-intel.html | Duplicate inline badge styles | ~6 |

**Total**: ~149 individual violations across ~20 files.

**What's clean**: No gradients anywhere. No 1px borders on cards/containers. No "Loading..." text (all personality-driven). Position colors correct everywhere. `:root` variables match DESIGN.md exactly. Dark mode tokens correct. No forbidden fonts in CSS. No cold grays in any CSS file. Shared `styles.css` is excellent.

**Overall grade: A-** — The design system is well-implemented. Issues are polish-level (warroom.js canvas palette is the biggest offender) rather than structural.
