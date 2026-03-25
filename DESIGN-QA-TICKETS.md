# Design QA Tickets — 2026-03-25

Audit method: Code-based site walk (CSS, HTML, JS) against `docs/DESIGN.md`.
Headless browser unavailable (razzle.lol returned 502; local browse rendered blank).

---

## DES-401: 1px borders in JS inline styles violate "no thin 1px borders" rule

**Severity**: HIGH
**Spec rule**: "Dashed dividers: 2px dashed var(--ink-faint) inside cards" (DESIGN.md line 154)

**Problem**: 15+ inline `border-bottom:1px solid var(--ink-faint)` instances across JS files. The color is correct but the thickness (1px) and style (solid) both violate the spec, which requires 2px dashed for internal dividers.

**Locations**:
- `frontend/charts.js` — lines 904, 908, 1270, 1274, 1295, 1304, 1312, 1316
- `frontend/lab.js` — lines 2397, 2413, 9246, 10773
- `frontend/formulas.js` — line 134
- `frontend/player.js` — line 753
- `frontend/lab-panels.js` — line 10196
- `frontend/agents.html` — line 2271 (1px dashed, thickness wrong)

**Fix**: Find-and-replace `border-bottom:1px solid var(--ink-faint)` → `border-bottom:2px dashed var(--ink-faint)` in all JS string literals. For agents.html line 2271, change `1px dashed` → `2px dashed`.

---

## DES-402: Cold Tailwind red #e74c3c used instead of palette red #e63946

**Severity**: HIGH
**Spec rule**: Accent `--red` is `#e63946` (DESIGN.md line 85)

**Problem**: The Flat UI / Tailwind red `#e74c3c` appears in multiple files as a fallback or primary color. This is a cooler, bluer red that clashes with Razzle's warm palette.

**Locations**:
- `frontend/agents.html` line 2156: `var(--red, #e74c3c)` — wrong fallback
- `frontend/lab-panels.js` line 6348: `td: '#e74c3c'` — hardcoded wrong red
- `frontend/lab-panels.js` line 6694: `'#e74c3c'` in multi-series color array

**Fix**: Replace all `#e74c3c` → `#e63946` site-wide.

---

## DES-403: Off-palette colors #6b5a4e and #a89585 in footer/auth sections

**Severity**: MEDIUM
**Spec rule**: Ink tokens are `--ink-medium: #5c4a3d` and `--ink-light: #8a7565` (DESIGN.md lines 57-58)

**Problem**: Three HTML files use `color:#6b5a4e` and `color:#a89585` as inline styles. These are close to but NOT the spec's ink tokens — they sit between defined stops, creating a blurry palette.

**Locations**:
- `frontend/agents.html` — lines 1604, 1607
- `frontend/lab.html` — lines 3155, 3158
- `frontend/league-intel.html` — lines 2535, 2538

**Fix**: Replace `#6b5a4e` → `var(--ink-medium)` and `#a89585` → `var(--ink-light)` in all three files.

---

## DES-404: Cold multi-series chart colors in canvas drawing

**Severity**: MEDIUM
**Spec rule**: All colors should be warm; position colors are QB blue, RB teal, WR terracotta, TE purple (DESIGN.md lines 96-102)

**Problem**: Multi-series chart line arrays use cold Tailwind-style colors that clash with the warm sand palette: `#eab308` (neon yellow), `#16a34a` (cold green), `#f472b6` (cold pink), `#4a9e5c` (cold forest green), `#c44daa` (cold purple).

**Locations**:
- `frontend/lab-panels.js` line 6694: `'#eab308', '#16a34a', '#f472b6'`
- `frontend/lab.js` lines 9678-9679, 9781-9782: `'#4a9e5c'`, `'#c44daa'`, `'#e87422'`, `'#d44040'`

**Fix**: Map to palette equivalents:
- `#eab308` → `#ffc857` (--yellow)
- `#16a34a` → `#2ec4b6` (--green)
- `#f472b6` → `#8b5cf6` (--purple)
- `#4a9e5c` → `#2ec4b6` (--green)
- `#c44daa` → `#8b5cf6` (--purple)

---

## DES-405: Hardcoded medal/rank colors instead of CSS variable tokens

**Severity**: MEDIUM
**Spec rule**: Use tokens, not hardcoded values (DESIGN.md line 149: "Use the token, not a hardcoded value")

**Problem**: Trade value rankings and badges use hardcoded gold/brown hex values instead of the existing `--medal-gold` and `--medal-bronze` CSS variables.

**Locations**:
- `frontend/lab-panels.css` line 580: `.tv-tier-num.t1 { background: #ffd700; }` → should be `var(--medal-gold)`
- `frontend/lab-panels.css` line 603: `.tv-rank.top1 { color: #b8860b; }` → should be `var(--medal-gold)` or a darker warm gold
- `frontend/lab-panels.css` line 605: `.tv-rank.top3 { color: #a0522d; }` → should be `var(--medal-bronze)` (`#cd7f32`)
- `frontend/lab-panels.css` line 3476: `.rc2-badge.gold { background: #ffd700; }` → should be `var(--medal-gold)`

**Fix**: Replace hardcoded values with the defined CSS variable tokens.

---

## DES-406: Cold black rgba(0,0,0) shadows instead of warm espresso

**Severity**: MEDIUM
**Spec rule**: Box shadows use `var(--ink)` which is espresso `#2d1f14`, not black (DESIGN.md line 155)

**Problem**: Two shadow definitions use cold `rgba(0,0,0,…)` instead of warm espresso-based alpha values.

**Locations**:
- `frontend/agents.html` line 259: `box-shadow: 4px 4px 0 rgba(0,0,0,0.4)` on canvas container
- `frontend/lab.html` line 1040: dark mode sticky header `box-shadow: 0 4px 8px rgba(0,0,0,0.25)`

**Before**: Cold black alpha shadows introduce a blue-gray cast on warm backgrounds.
**After**: Use `rgba(45,31,20,0.4)` (espresso alpha) or `var(--ink)` for offset shadows.

---

## DES-407: Warroom fallback color #666 is cold gray

**Severity**: MEDIUM
**Spec rule**: Ink palette is warm espresso brown, not blue-black. "Brown on sand is the Razzle signature" (DESIGN.md lines 51-52)

**Problem**: The Situation Room's `warroom.js` uses `#666` as a fallback for unknown agent state colors. This is a cold neutral gray that violates the "no cold grays anywhere" principle. Also, line 4041 hardcodes `background:#2ec4b6` instead of using `var(--green)`.

**Locations**:
- `frontend/warroom.js` line 1374: `STATE_COLORS[a.state] || '#666'`
- `frontend/warroom.js` line 4041: `style="background:#2ec4b6"` (hardcoded green)

**Fix**: Replace `'#666'` → `'#8a7565'` (ink-light warm equivalent for canvas). Replace `background:#2ec4b6` → `background:var(--green)`.

---

## DES-408: Agent persona colors not documented in DESIGN.md

**Severity**: LOW
**Spec rule**: "One accent color per component" — all colors should be on the palette

**Problem**: Agent identity colors in `agent-config.js` predate the design guide and are not documented as design tokens. They bleed into badges, charts, and the Situation Room UI but aren't in the palette.

**Locations**:
- `frontend/agent-config.js` line 94: Octo (Quant) `#e87422` — burnt orange, not terracotta `#d97757`
- `frontend/agent-config.js` line 122: Atlas (Historian) `#d44040` — mid red, not palette red `#e63946`

**Fix**: Either (a) add `--agent-quant` and `--agent-historian` tokens to DESIGN.md and styles.css, or (b) remap agents to existing palette colors. Option (a) is preferred — agents are a permanent UI concept.

---

## DES-409: prompts.html adds self-link to global navigation

**Severity**: LOW
**Spec rule**: Navigation should be consistent across all pages

**Problem**: `frontend/prompts.html` adds a 6th nav link (to itself) between "AI Agents" and "Pricing." All 74 other pages have exactly 5 nav links. This creates a jarring navigation inconsistency when users land on this page.

**Location**: `frontend/prompts.html` line ~103

**Fix**: Remove the self-referential `/prompts.html` link from the topnav. If this page needs discoverability, link to it from the Situation Room or tools hub instead.

---

## DES-410: Print stylesheet uses cold white #fff instead of brand sand

**Severity**: LOW
**Spec rule**: Background is `#ede0cf` Anthropic sand (DESIGN.md line 46)

**Problem**: The cheat sheet print media query resets `body { background: #fff; }` — pure cold white. Users printing or exporting to PDF get an off-brand white page instead of the signature sand.

**Location**: `frontend/cheatsheet.html` line 227

**Fix**: Change to `background: #ede0cf;` for brand consistency in PDF exports. If ink savings are a concern, add a comment: `/* sand bg for brand — override with #fff if print economy needed */`.

---

## Summary

| ID | Title | Severity | Files |
|----|-------|----------|-------|
| DES-401 | 1px borders in JS inline styles | HIGH | charts.js, lab.js, formulas.js, player.js, lab-panels.js, agents.html |
| DES-402 | Cold red #e74c3c instead of palette #e63946 | HIGH | agents.html, lab-panels.js |
| DES-403 | Off-palette ink colors #6b5a4e, #a89585 | MEDIUM | agents.html, lab.html, league-intel.html |
| DES-404 | Cold multi-series chart colors | MEDIUM | lab-panels.js, lab.js |
| DES-405 | Hardcoded medal colors instead of CSS vars | MEDIUM | lab-panels.css |
| DES-406 | Cold black rgba shadows | MEDIUM | agents.html, lab.html |
| DES-407 | Cold gray #666 fallback in warroom | MEDIUM | warroom.js |
| DES-408 | Agent persona colors not in DESIGN.md | LOW | agent-config.js |
| DES-409 | prompts.html adds extra nav link | LOW | prompts.html |
| DES-410 | Print stylesheet uses cold white | LOW | cheatsheet.html |
