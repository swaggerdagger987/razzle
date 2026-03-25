# Design QA Tickets — 2026-03-25 (v4)

Audited all 75 HTML pages, 2 CSS files, and 8 JS files against `docs/DESIGN.md`.

---

## DES-206: Off-brand agent colors — Octo and Atlas use hex values not in the palette

**Severity**: Medium
**Files**: `frontend/agent-config.js`

| Agent | Current | Nearest Palette Color | Token |
|-------|---------|----------------------|-------|
| Octo (Quant) | `#e87422` (line 94) | `#d97757` tiger terracotta | `--orange` |
| Atlas (Historian) | `#d44040` (line 122) | `#e63946` red | `--red` |

Every other agent uses an exact palette color (Dolphin=#5b7fff, Hawkeye=#2ec4b6, Bones=#8b5cf6, Razzle=#d97757). Octo and Atlas are off-brand custom hex values that don't appear anywhere in DESIGN.md.

**Fix**: Replace `#e87422` with `#d97757` and `#d44040` with `#e63946`. If Octo needs a distinct color from Razzle (both orange), use `#ffc857` (yellow) instead — that's the only unused accent.

---

## DES-207: Dark mode --ink-light value (#a89888) doesn't match DESIGN.md spec (#8a7565)

**Severity**: Low
**File**: `frontend/styles.css:81`

DESIGN.md says dark mode `--ink-light` should be `#8a7565` (shared between light and dark modes). The CSS uses `#a89888` instead — a cooler, lighter value that shifts toward gray rather than staying warm brown.

**Fix**: Change `--ink-light: #a89888` to `--ink-light: #8a7565` in the `[data-theme="dark"]` block at line 81.

---

## DES-208: Gradient used in prompts.html — design guide prohibits gradients

**Severity**: Low
**File**: `frontend/prompts.html:78`

```css
.prompt-text:not(.expanded)::after {
  background: linear-gradient(transparent, var(--bg));
}
```

DESIGN.md says "NO gradients" under the Don't list. This is a fade-out effect for truncated prompt text.

**Fix**: Replace with a solid 2-line clamp + `text-overflow: ellipsis`, or use a solid `var(--bg)` bottom border/overlay. The existing "Read more" toggle already handles expansion.

---

## DES-209: 14px border-radius on cards — should be 12px (--radius)

**Severity**: Medium
**Files**: 4 locations

| File | Line | Element |
|------|------|---------|
| `frontend/archetypes.html` | 115 | `.ar-archetype` card |
| `frontend/tiers.html` | 120 | tier row container |
| `frontend/dashboard.html` | 113 | dashboard card |
| `frontend/lab-panels.css` | 411 | `.tl-tier` tier label |

The design system defines three radius tokens: 8px, 12px, 20px. `14px` falls between `--radius` (12px) and `--radius-lg` (20px) and matches no token.

**Fix**: Replace all `border-radius: 14px` with `border-radius: var(--radius)` (12px).

---

## DES-210: 6px border-radius across 15+ standalone pages — should be 8px (--radius-sm)

**Severity**: High (widespread)
**Files**: 12 HTML pages with inline `<style>` blocks

| File | Line |
|------|------|
| `buysell.html` | 326 |
| `breakouts.html` | 258 |
| `auction.html` | 219 |
| `league-intel.html` | 451, 2126, 2204, 2370 |
| `percentiles.html` | 213 |
| `pace.html` | 231 |
| `prospects.html` | 300 |
| `lab.html` | 2246, 2493 |
| `rosterbuilder.html` | 292 |
| `scarcity.html` | 234 |
| `tradefinder.html` | 390 |
| `tradevalues.html` | 302 |

All use `border-radius: 6px` on small elements (badges, bars, progress fills). The smallest design token is `--radius-sm` at 8px.

**Fix**: Find-and-replace `border-radius: 6px` with `border-radius: var(--radius-sm)` (8px) across all listed files. Also add `--radius-sm` import comment so future pages use the token.

---

## DES-211: Pricing toggle uses 13px border-radius — should be 20px (--radius-lg)

**Severity**: Low
**File**: `frontend/pricing.html:41`

```css
.interval-toggle .toggle-track {
  border-radius: 13px;
}
```

Toggle pills are sticker-shaped elements that should use `--radius-lg` (20px). `13px` looks under-rounded for a pill toggle.

**Fix**: Replace `border-radius: 13px` with `border-radius: var(--radius-lg)` (20px).

---

## DES-212: Progress bar border-radius chaos in lab-panels.css — 4 different values

**Severity**: Medium
**File**: `frontend/lab-panels.css`

Progress/stat bars use four inconsistent border-radius values:

| Value | Count | Example classes |
|-------|-------|-----------------|
| `2px` | 6 | `.ww-recent-bar`, `.se-bar`, `.wl-bar`, `.tp-bar`, `.dr-bar`, `.gt-bar` |
| `3px` | 3 | `.dt-split-bar`, `.sk-corr-bar`, `.sw2-stat-pct-bar`/`-fill` |
| `4px` | 13 | `.tv-bar-fill`, `.av-tv-bar`/`-fill`, `.pt-pace-bar`, `.tdr-bar`, `.fpb-bar`, `.db2-scar-bar`, `.pct2-bar-fill`, `.bb-pct-bar`/`-fill`, `.rbld-dim-bar`/`-fill`, `.sr2-bar` |
| `5px` | 1 | `.pa-bar` |

**Fix**: Standardize all bar elements to `border-radius: 4px`. For bars with height <= 8px, 4px gives fully-rounded ends. For taller bars (14-22px), 4px gives a subtle rounding. This is the most common existing value and works well at all bar heights.

---

## DES-213: card-hero shadow uses non-standard 5px 5px 0

**Severity**: Low
**File**: `frontend/styles.css:849`

```css
.card-hero {
  border-width: 3px;
  box-shadow: 5px 5px 0 var(--ink);
}
```

The design system defines two shadow levels: `4px 4px 0` (standard) and `6px 6px 0` (hover-lift). `5px 5px 0` is an undefined middle ground. The `.card-spotlight` below it correctly uses `4px 4px 0`.

**Fix**: Change to `box-shadow: 6px 6px 0 var(--ink)` to give hero cards the maximum emphasis level, creating a clear visual hierarchy: spotlight (4px) < hero (6px).

---

## DES-214: Hardcoded #fff white in lab.js private browsing banner

**Severity**: Medium
**File**: `frontend/lab.js:1185`

```js
banner.style.cssText = "background:var(--orange);color:#fff;..."
```

`#fff` (pure white) is not in the Razzle palette. On an orange background, the text-on-accent should use `var(--text-on-accent)` or `var(--bg)` which resolves correctly in both light and dark mode. The current value breaks the warm espresso aesthetic — white is cold.

**Fix**: Replace `color:#fff` with `color:var(--text-on-accent)`.

---

## DES-215: Sticker-chip and button hover shadows use non-standard 3px offset

**Severity**: Medium
**Files**: `frontend/styles.css` + 15 HTML files

The `.sticker-chip`, `.btn-chunky:hover`, `.btn-primary:hover`, and `.input-chunky:focus` all use `box-shadow: 3px 3px 0 var(--ink)`. This value isn't in the design system (standard levels are 2px and 4px).

**Affected in styles.css**:
- Line 768: `.btn-chunky:hover` — 3px 3px
- Line 796: `.btn-primary:hover` — 3px 3px
- Line 946: `.input-chunky:focus` — 3px 3px
- Line 1066: `.theme-toggle:hover` — 3px 3px
- Line 1662: `.sticker-chip` default — 3px 3px

**Also in HTML inline styles** (15+ files): aging.html, cheatsheet.html, lab.html, league-intel.html, matchups.html, pricing.html, prompts.html, rosterbuilder.html, scoring.html, targets.html, tiers.html, tools.html, weekly.html, and others.

**Fix**: In `styles.css`, change hover shadows from `3px 3px 0` to `4px 4px 0` for standard hover states. The base button/chip shadow stays at `2px 2px 0`. This gives a clean 2px → 4px progression (rest → hover) matching the design system's defined levels. Audit HTML inline styles to match.

---

## Summary

| # | Ticket | Severity | Scope |
|---|--------|----------|-------|
| DES-206 | Off-brand agent colors | Medium | 2 values in 1 file |
| DES-207 | Dark mode ink-light mismatch | Low | 1 CSS variable |
| DES-208 | Prohibited gradient | Low | 1 file |
| DES-209 | 14px radius (should be 12px) | Medium | 4 locations |
| DES-210 | 6px radius (should be 8px) | High | 15+ files |
| DES-211 | 13px toggle radius | Low | 1 file |
| DES-212 | Progress bar radius chaos | Medium | 23 classes in 1 file |
| DES-213 | card-hero 5px shadow | Low | 1 rule |
| DES-214 | Hardcoded #fff white | Medium | 1 inline style |
| DES-215 | Non-standard 3px shadow | Medium | styles.css + 15 HTML files |
