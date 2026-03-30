# Design QA Batch — 2026-03-23

10 tickets from a full design audit against DESIGN.md. Ordered by visual impact.

---

## TICKET 1: warroom.js cold grays — 31 hardcoded gray hex values
**Priority**: P1
**File**: `frontend/warroom.js`
**What's wrong**: The pixel canvas palette and drawing functions use 31+ cold gray hex values (`#333`, `#444`, `#555`, `#666`, `#888`, `#999`, `#aaa`, `#ccc`, `#222222`, `#444444`, `#666666`, `#888888`, `#aaaaaa`) instead of warm espresso browns from the design guide. The Situation Room canvas looks cold and disconnected from the warm sand/espresso aesthetic.
**Fix**: Replace cold grays in the PALETTE object (lines ~34-86) and all drawing functions with warm espresso equivalents:
- `#222` → `#2d1f14` (espresso)
- `#333` → `#3b2821` (warm espresso)
- `#444` → `#4a3728` (mocha)
- `#555` → `#5c4a3d` (ink-medium)
- `#666` → `#6b5a4d`
- `#888` → `#8a7565` (ink-light)
- `#999` → `#9a8a7a`
- `#aaa` → `#a89888`
- `#ccc` → `#c4b5a5` (ink-faint)
- `#fff` (bubbleBg/nameText) → `#f7efe5` (bg-card)

Also replace `rgba(0,0,0,...)` with `rgba(45,31,20,...)` throughout.
**Count**: ~50 replacements across the file.

---

## TICKET 2: agents.html cold black shadows — rgba(0,0,0) on 3 elements
**Priority**: P1
**File**: `frontend/agents.html`
**What's wrong**: Three inline styles use cold black `rgba(0,0,0,...)` for drop-shadows/box-shadows instead of warm espresso brown.
**Fix**:
- Line 39: `filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.15))` → `rgba(45,31,20,0.15)`
- Line 259: `box-shadow: 4px 4px 0 rgba(0,0,0,0.4)` → `rgba(45,31,20,0.4)`
- Line 285: `filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3))` → `rgba(45,31,20,0.3)`

---

## TICKET 3: lab.js 1px borders — 4 instances of border-bottom:1px
**Priority**: P2
**File**: `frontend/lab.js`
**What's wrong**: Four table row borders use `border-bottom:1px solid var(--ink-faint)` instead of the 2px minimum from DESIGN.md.
**Fix**: Change `border-bottom:1px` to `border-bottom:2px` at:
- Line 2397 (weekly breakdown table header)
- Line 2413 (weekly breakdown table rows)
- Line 9246 (trade value autocomplete rows)
- Line 10773 (player comp table rows)

---

## TICKET 4: lab.js 1px padding on badges — 13 inline badge styles
**Priority**: P2
**File**: `frontend/lab.js`
**What's wrong**: 13 badge/chip `<span>` styles use `padding:1px 5px` or `padding:1px 6px`. The 1px vertical padding makes badges too thin — doesn't match the chunky comic-strip aesthetic.
**Fix**: Change all `padding:1px` to `padding:2px` in badge/chip inline styles. Lines: 375, 1930, 1934, 2195, 9199, 9247, 9307, 10209, 10297, 10300, 11552, 11635, 11719.

---

## TICKET 5: styles.css button active states — 1px box-shadow on 4 buttons
**Priority**: P2
**File**: `frontend/styles.css`
**What's wrong**: Four button `:active` states use `box-shadow: 1px 1px 0 var(--ink)` while normal/hover states correctly use 2-3px. The "pressed" state should still use a minimum 2px offset.
**Fix**: Change `1px 1px 0` to `2px 2px 0` at:
- Line 257 (`.hamburger-toggle:active`)
- Line 325 (`.mobile-nav-close:active`)
- Line 771 (`.btn-chunky:active`)
- Line 799 (`.btn-primary:active`)

---

## TICKET 6: styles.css hardcoded rgba overlays — 6 overlay backgrounds
**Priority**: P2
**File**: `frontend/styles.css`
**What's wrong**: Six overlay backgrounds hardcode `rgba(45,31,20,X)` and `rgba(26,17,10,X)` instead of using CSS custom properties. While the colors ARE correct espresso browns, they bypass the variable system and won't adapt if palette changes.
**Fix**: Define overlay variables in `:root`:
```css
--overlay-light: rgba(45,31,20,0.4);
--overlay-medium: rgba(45,31,20,0.5);
```
Then use them at lines 271, 274, 643, 649, 1072, 1079.

---

## TICKET 7: warroom.js nameTag/bubble use cold black/white
**Priority**: P2
**File**: `frontend/warroom.js`
**What's wrong**: Agent name tags use `rgba(0,0,0,0.7)` background and `#ffffff` text. Speech bubbles use `#ffffff` background and `#333333` border. These are cold black/white — should use espresso/cream.
**Fix**:
- `nameTag: 'rgba(0,0,0,0.7)'` → `'rgba(45,31,20,0.8)'`
- `nameText: '#ffffff'` → `'#f7efe5'` (bg-card)
- `bubbleBg: '#ffffff'` → `'#f7efe5'` (bg-card)
- `bubbleBorder: '#333333'` → `'#3b2821'` (warm espresso)

---

## TICKET 8: index.html mini-pos badge 1px padding
**Priority**: P3
**File**: `frontend/index.html`
**What's wrong**: Line 458 `.mini-pos { padding: 1px 5px; }` — position badges on the home page use 1px vertical padding, making them too thin vs the chunky aesthetic.
**Fix**: Change to `padding: 2px 6px;`

---

## TICKET 9: Panel pages hardcoded color fallbacks — aging, matchups, weekly
**Priority**: P3
**Files**: `frontend/aging.html`, `frontend/matchups.html`, `frontend/weekly.html`, `frontend/dashboard.html`
**What's wrong**: Position color maps and heat color functions include hardcoded hex fallbacks like `|| '#5b7fff'` and `|| '#2ec4b6'`. While these match the palette, they bypass CSS variables and won't respond to dark mode theme changes.
**Fix**: Remove hardcoded fallbacks or use `getComputedStyle` reads that actually work in dark mode. Example: replace `_cs.getPropertyValue('--pos-qb').trim() || '#5b7fff'` with just `_cs.getPropertyValue('--pos-qb').trim()` since the CSS variables are always defined.

---

## TICKET 10: styles.css search-hl hardcoded orange rgba + 1px padding
**Priority**: P3
**File**: `frontend/styles.css`
**What's wrong**: Line 891-897: `.search-hl` uses `rgba(217, 119, 87, 0.25)` (hardcoded orange) and `padding: 0 1px`. The color should reference the design system, and padding should be at least 2px.
**Fix**:
- Change `padding: 0 1px` to `padding: 0 2px`
- Add a CSS variable `--orange-highlight: rgba(217, 119, 87, 0.25)` and reference it, OR accept the hardcode since CSS can't do rgba with a hex variable without decomposition.
