# Design QA Tickets — 2026-03-25

Audit of all frontend files against `docs/DESIGN.md`. 10 tickets, ordered by severity.

---

## TICKET 1 — HIGH: warroom.js has 50+ hardcoded cold gray hex values

**Rule violated**: "Cold grays anywhere — even dark mode stays warm (brown, not gray)"

**Files**: `frontend/warroom.js`

**Evidence** (sample):
- Line 59: `boardFrame: '#444444'`
- Line 67: `coffeeAccent: '#888888'`
- Line 69: `trophyBase: '#666666'`
- Line 77: `wbFrame: '#aaaaaa'`
- Line 85: `bubbleBorder: '#333333'`
- Lines 418-650: dozens of `px()` calls with `'#333'`, `'#555'`, `'#666'`, `'#ccc'`, `'#ddd'`, `'#888'`, `'#aaa'`
- Lines 1039-1071: more `px()` and `ctx.fillStyle` with `'#333'`, `'#999'`, `'#888'`, `'#555'`, `'#ccc'`
- Line 1251: `let dotColor = '#666'`
- Line 1328: `STATE_COLORS fallback '#666'`

**Total**: ~50+ cold gray values across the pixel engine color palette, furniture sprites, UI overlays, and debug indicators.

**Fix**: Create a warm-shifted pixel palette object at top of file. Map every cold gray to a warm espresso equivalent:
- `#333` → `#3b2821` (warm dark)
- `#444` → `#4a3728` (mocha)
- `#555` → `#5c4a3d` (ink-medium)
- `#666` → `#6b5a4e` (warm mid)
- `#888` → `#8a7565` (ink-light)
- `#999` → `#a08878`
- `#aaa` → `#b0a090`
- `#ccc` → `#c4b5a5` (ink-faint)
- `#ddd` → `#d5c8b8`

---

## TICKET 2 — MEDIUM: lab-panels.css has 30+ non-standard border-radius values

**Rule violated**: "Use the token, not a hardcoded value. New components should pick the nearest token." Tokens are 8px, 12px, 20px.

**File**: `frontend/lab-panels.css`

**Evidence** (all lines):
- Line 411: `border-radius: 14px` → use `var(--radius)` (12px)
- Line 618: `border-radius: 6px` → use `var(--radius-sm)` (8px)
- Line 619: `border-radius: 4px` → use `var(--radius-sm)` (8px)
- Line 765: `border-radius: 5px` → use `var(--radius-sm)` (8px)
- Lines 797-798: `border-radius: 4px` x2
- Line 1997: `border-radius: 3px`
- Line 2225: `border-radius: 4px`
- Line 2370: `border-radius: 3px`
- Lines 2754-2755: `border-radius: 4px` x2
- Lines 2807-2808: `border-radius: 4px` x2
- Lines 3031-3032: `border-radius: 3px` x2
- Lines 3039-3040: `border-radius: 7px` x2
- Line 3098: `border-radius: 4px`
- Lines 3313-3314: `border-radius: 4px` x2
- Lines 3420-3421: `border-radius: 6px` x2
- Lines 3452-3453: `border-radius: 4px` x2
- Lines 3529-3530: `border-radius: 4px` x2
- Line 3609: `border-radius: 4px`
- Line 3621: `border-radius: 6px`

**Fix**: For progress bar tracks/fills (most of these), add a new token `--radius-bar: 4px` or use `var(--radius-sm)`. Thin inline bars (3-6px) could use `border-radius: 999px` for pill-shaped bars. For containers at 14px, use `var(--radius)` (12px).

---

## TICKET 3 — MEDIUM: 15+ HTML files use hardcoded border-radius in page `<style>` blocks

**Rule violated**: Border radius should use CSS variable tokens.

**Files and lines**:
- `auction.html:219` — `border-radius: 6px`
- `breakouts.html:258` — `border-radius: 6px`
- `buysell.html:326` — `border-radius: 6px`
- `lab.html:2246` — `border-radius: 6px`
- `lab.html:2493` — `border-radius: 6px`
- `percentiles.html:213` — `border-radius: 6px 0 0 4px`
- `prospects.html:300` — `border-radius: 6px`
- `pace.html:231` — `border-radius: 6px`
- `rosterbuilder.html:292` — `border-radius: 6px`
- `scarcity.html:234` — `border-radius: 6px`
- `league-intel.html:451, 2126, 2204, 2370` — `border-radius: 6px`
- `archetypes.html:115` — `border-radius: 14px`
- `dashboard.html:113` — `border-radius: 14px`
- `tiers.html:120` — `border-radius: 14px`

**Fix**: Replace `6px` with `var(--radius-sm)` (8px). Replace `14px` with `var(--radius)` (12px).

---

## TICKET 4 — MEDIUM: Noscript fallbacks use hardcoded colors, break dark mode

**Rule violated**: "Cold grays anywhere — even dark mode stays warm" + dark mode won't flip.

**Files and lines**:
- `agents.html:1604` — `color:#6b5a4e` (hardcoded, won't flip in dark mode)
- `agents.html:1607` — `color:#a89585` (hardcoded)
- `lab.html:3155` — `color:#6b5a4e` (hardcoded)
- `lab.html:3158` — `color:#a89585` (hardcoded)
- `league-intel.html:2535` — `color:#6b5a4e` (hardcoded)
- `league-intel.html:2538` — `color:#a89585` (hardcoded)

Also hardcoded `font-family` in inline styles at these same locations instead of using CSS classes.

**Fix**: Create a `.noscript-msg` CSS class in `styles.css` with `color: var(--ink-medium)` and `font-family: var(--font-mono)`. Replace all 6 inline style blocks with the class. This also fixes dark mode for noscript users.

---

## TICKET 5 — MEDIUM: 25+ inline badges use 1px vertical padding

**Rule violated**: Design system badges use chunky styling. `padding: 1px` makes badges feel cramped and thin — out of character for the comic-strip aesthetic.

**File**: `frontend/lab.js` (primary), plus `charts.js`, `formula-store.js`, `league-intel.html`, `warroom.js`

**Evidence** (sample from lab.js):
- Line 1930: `padding:1px 8px`
- Line 1934: `padding:1px 6px`
- Line 2195: `padding:1px 5px`
- Line 9199: `padding:1px 5px`
- Line 9247: `padding:1px 5px`
- Line 10209: `padding:1px 6px`
- Line 10297: `padding:1px 5px`
- Line 11552: `padding:1px 5px`
- Line 11635: `padding:1px 5px`
- Line 11719: `padding:1px 5px`

Also: `charts.js:891,1259`, `formula-store.js:527`, `league-intel.html:2881,3028,3039,3073,4389`, `warroom.js:3113`

**Fix**: Change `padding:1px Xpx` → `padding:2px Xpx` across all inline badge styles. Consider extracting a `.badge-sm` utility class to DRY up 25+ identical inline style strings.

---

## TICKET 6 — MEDIUM: JS files use hardcoded border-radius in inline styles

**Rule violated**: Border radius should use CSS variable tokens.

**Files and lines**:
- `lab-panels.js:9577` — `border-radius:6px`
- `lab-panels.js:9579, 9580` — `border-radius:3px`
- `lab-panels.js:9600` — `border-radius:6px`
- `lab-panels.js:9646` — `border-radius:3px`
- `charts.js:891` — `border-radius:4px`
- `charts.js:1259` — `border-radius:4px`
- `formulas.js:132` — `border-radius:4px`
- `formulas.js:273` — `border-radius:4px`
- `league-intel.html:2881, 3028, 3073, 3123` — `border-radius:6px` and `4px` in JS template literals

**Fix**: Replace hardcoded values with `var(--radius-sm)` in inline style strings. CSS vars work in inline styles.

---

## TICKET 7 — LOW: Soft blur box-shadow on screener sticky header

**Rule violated**: "Box shadows: `4px 4px 0 var(--ink)` on cards, containers" — design says chunky offset, not blur.

**File**: `frontend/lab.html`
- Line 1037: `box-shadow: 0 4px 8px rgba(45,31,20,0.08)` (light mode)
- Line 1040: `box-shadow: 0 4px 8px rgba(0,0,0,0.25)` (dark mode)

This is a functional scroll-indicator shadow on the sticky `<thead>`, not a decorative card shadow.

**Fix**: Replace with `box-shadow: 0 3px 0 var(--ink-faint)` for a chunky bottom-edge shadow. Or keep as-is — it's a functional UX indicator.

---

## TICKET 8 — LOW: league-intel.html duplicates inline badge styles 6+ times

**Rule violated**: Maintainability / DRY. Same badge pattern repeated in JS template literals.

**File**: `frontend/league-intel.html`
- Line 2881: `<span style="font-family:var(--font-mono);font-size:8px;background:var(--orange);color:var(--text-on-accent);padding:1px 5px;border-radius:6px;margin-left:4px;">`
- Line 3028: Similar inline badge
- Line 3039: Similar inline badge
- Line 3073: Similar inline badge
- Line 3123: Similar inline badge with `border-radius:4px`
- Line 4389: Similar inline badge

**Fix**: Add a `.badge-you` CSS class:
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
Replace all 6+ inline style strings with `class="badge-you"`.

---

## TICKET 9 — LOW: research-sprawl.svg uses system fonts with no Razzle fallback

**Rule violated**: "Don't use system fonts (Arial, Helvetica, sans-serif) as primary"

**File**: `frontend/assets/research-sprawl.svg:1`
- `font-family="system-ui, -apple-system, sans-serif"` — no Razzle design system font at all.

The OG image SVGs (`og-image.svg`, `og-image-lab.svg`) correctly use `'Luckiest Guy', 'Impact', sans-serif`.

**Fix**: Change to `font-family="'Luckiest Guy', 'Impact', sans-serif"` or `"'Space Mono', monospace"` depending on the text content.

---

## TICKET 10 — LOW: backdrop-filter blur on command palette overlay

**Rule violated**: Borderline — design says no soft/blurry effects.

**File**: `frontend/styles.css:1084`
- `backdrop-filter: blur(4px)` on `.cmd-palette-backdrop`

**Fix (optional)**: Replace with a solid semi-transparent overlay `background: rgba(45,31,20,0.6)` without blur. Or keep as-is — backdrop blur on modal overlays is a standard UX pattern distinct from decorative blurry box-shadows.

---

## Summary

| # | Severity | File(s) | Issue | Instances |
|---|----------|---------|-------|-----------|
| 1 | HIGH | warroom.js | Cold gray hex values in pixel engine | ~50 |
| 2 | MEDIUM | lab-panels.css | Non-standard border-radius (3-7px, 14px) | ~30 |
| 3 | MEDIUM | 15 HTML files | Hardcoded border-radius in `<style>` blocks | ~20 |
| 4 | MEDIUM | 3 HTML files | Noscript hardcoded colors, no dark mode | 6 |
| 5 | MEDIUM | lab.js + 4 others | 1px vertical padding on inline badges | ~25 |
| 6 | MEDIUM | JS files | Hardcoded border-radius in inline styles | ~14 |
| 7 | LOW | lab.html | Soft blur shadow on sticky thead | 2 |
| 8 | LOW | league-intel.html | Duplicate inline badge styles | ~6 |
| 9 | LOW | SVG assets | System font in research-sprawl.svg | 1 |
| 10 | LOW | styles.css | backdrop-filter blur on cmd palette | 1 |

**Total violations**: ~155 instances across ~20 files

**Clean areas**: No gradients. No 1px borders on cards/containers. No "Loading..." text (all personality). Position colors correct. `styles.css` `:root` variables match DESIGN.md exactly. Dark mode tokens correct. No cold grays in CSS (only in warroom.js canvas code).
