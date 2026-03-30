# Design QA Tickets — 2026-03-25

Source: Automated codebase audit against `docs/DESIGN.md`. All findings verified via grep/read.

---

## TICKET 1: Normalize box-shadow offsets to 4px/6px standard

**Severity**: HIGH — Visual inconsistency across 25+ files
**Design rule**: Cards use `4px 4px 0 var(--ink)`, hover uses `6px 6px 0`

**Problem**: 33 occurrences of `3px 3px 0` across 18 files and 11 occurrences of `5px 5px 0` across 7 files. These are likely from an earlier design iteration and create subtle visual inconsistency — some cards look heavier/lighter than neighbors.

**Files** (3px 3px 0):
- `styles.css` (5 hits)
- `lab-panels.css` (3)
- `lab.html` (4), `league-intel.html` (4), `tools.html` (3)
- `about.html`, `agents.html`, `aging.html`, `cheatsheet.html`, `index.html`, `matchups.html`, `pricing.html`, `prompts.html`, `rosterbuilder.html`, `scoring.html`, `targets.html`, `tiers.html`, `weekly.html` (1 each)

**Files** (5px 5px 0):
- `styles.css` (3 hits)
- `league-intel.html` (3)
- `about.html`, `agents.html`, `index.html`, `lab.html`, `matchups.html` (1 each)

**Fix**: Global find-replace `3px 3px 0` → `4px 4px 0` and `5px 5px 0` → `6px 6px 0` (the 5px versions are likely hover states). Review each to confirm card vs hover context.

---

## TICKET 2: Replace cold rgba(0,0,0,...) shadows with warm espresso

**Severity**: HIGH — Breaks warm-sand identity
**Design rule**: Shadows use `var(--ink)` (espresso), not black

**Problem**: 6 instances of cold black rgba in box-shadow and drop-shadow, creating a harsh blue-black shadow on warm sand backgrounds. Breaks the "leather and parchment" feel.

**Findings**:
1. `agents.html:259` — `.canvas-container` box-shadow: `rgba(0,0,0,0.4)` → should be `var(--ink)`
2. `agents.html:39` — drop-shadow: `rgba(0,0,0,0.15)` → `rgba(45,31,20,0.15)`
3. `agents.html:285` — drop-shadow: `rgba(0,0,0,0.3)` → `rgba(45,31,20,0.3)`
4. `lab.html:1040` — dark mode thead shadow: `rgba(0,0,0,0.25)` → `rgba(26,17,10,0.25)` (use `--bg-ink` rgb values)

**Fix**: Replace `rgba(0,0,0,...)` with `rgba(45,31,20,...)` (espresso) in light mode, `rgba(26,17,10,...)` in dark mode contexts.

---

## TICKET 3: Replace blur-style shadows with flat offset shadows

**Severity**: MEDIUM — Violates chunky comic-strip aesthetic
**Design rule**: `4px 4px 0 var(--ink)` — zero blur, hard offset

**Problem**: 2 instances use soft diffused shadows (blur > 0) that look like fintech/material design, not Razzle's sticker aesthetic.

**Findings**:
1. `lab.html:596` — `box-shadow: -8px 0 24px rgba(45,31,20,0.15)` (frozen column shadow)
2. `lab.html:1037` — `box-shadow: 0 4px 8px rgba(45,31,20,0.08)` (sticky thead shadow)

**Note**: These serve a functional purpose (indicating scroll continuation). Replace with a hard 2px dashed border or a solid color strip rather than a diffuse shadow. Alternative: use a `border-right: 2px dashed var(--ink-faint)` for the frozen column edge.

---

## TICKET 4: Upgrade 15 remaining 1px borders to 2px

**Severity**: MEDIUM — Breaks "chunky" rule
**Design rule**: Minimum border width is 2px. Cards=3px, chips/badges=2px, dashed dividers=2px.

**Problem**: 15 instances of `1px solid` in JS-generated DOM styles (table rows, list dividers). These create thin hairline borders that look fragile against the chunky 3px card borders.

**Files**:
- `charts.js` — 8 instances (table cell borders in chart overlays)
- `lab.js` — 4 instances (table row borders, list items)
- `player.js:749` — 1 instance (search result divider)
- `formulas.js:140` — 1 instance (formula list divider)
- `lab-panels.js:10205` — 1 instance (table row border)

Plus 1 instance of `1px dashed` in `agents.html:2272`.

**Fix**: Replace `1px solid` → `2px solid` in all JS border assignments. Replace `1px dashed` → `2px dashed`.

---

## TICKET 5: Replace off-brand hardcoded colors with design tokens

**Severity**: MEDIUM — Non-system colors in visible UI
**Design rule**: All colors from the approved palette

**Problem**: Several hardcoded hex colors that don't match any design token:

1. **`#6b5a4e` and `#a89585`** — used in noscript/error fallback blocks in 3 files:
   - `agents.html:1604,1607`
   - `lab.html:3155,3158`
   - `league-intel.html:2535,2538`
   - These are close to but not exactly `--ink-medium` (#5c4a3d) and `--ink-light` (#8a7565)

2. **`#e74c3c`** (Tailwind red, not Razzle red `#e63946`) — used in:
   - `agents.html:2157` — urgency color fallback
   - `lab-panels.js:6356` — TD component color in FPTS breakdown
   - `lab-panels.js:6702` — comparison color array

3. **`#eab308`, `#16a34a`, `#f472b6`** (Tailwind yellow/green/pink) in:
   - `lab-panels.js:6702` — comparison chart color palette

**Fix**: Replace `#6b5a4e` → `var(--ink-medium)`, `#a89585` → `var(--ink-light)`, `#e74c3c` → `var(--red)` / `#e63946`, replace Tailwind colors with design system equivalents (`#ffc857`, `#2ec4b6`, `#d97757`).

---

## TICKET 6: Cold rgba(0,0,0,...) in modal overlays

**Severity**: MEDIUM — Dark mode and light mode feel cold
**Design rule**: Overlays should use warm espresso tones

**Problem**: Modal overlay backgrounds use cold `rgba(0,0,0,...)` instead of warm espresso `rgba(45,31,20,...)` or `rgba(26,17,10,...)`:

1. `player.js:722` — player profile overlay: `rgba(0,0,0,0.5)`
2. `lab.html:905` — dark mode modal overlay: `rgba(0,0,0,0.5)`
3. `lab.html:954` — dark mode column picker overlay: `rgba(0,0,0,0.5)`

**Fix**: Replace all `rgba(0,0,0,...)` overlays with `rgba(45,31,20,...)` for light mode, `rgba(26,17,10,...)` for dark mode. The styles.css already uses the warm version in some places (auth modal, command palette) — follow that pattern.

---

## TICKET 7: 19 panel pages missing 480px mobile breakpoint

**Severity**: MEDIUM — Phone users get tablet layout
**Design rule**: All pages responsive at 768px + 480px

**Problem**: 19 standalone panel pages only have a `@media (max-width: 768px)` breakpoint but no `@media (max-width: 480px)` breakpoint. On small phones (375px width), table content overflows and text sizes aren't optimized.

**Pages missing 480px**:
`drops.html`, `breakdown.html`, `comptable.html`, `fptsbreakdown.html`, `gamelog.html`, `gamescript.html`, `garbagetime.html`, `handcuffs.html`, `prompts.html`, `records.html`, `seasonpace.html`, `snapefficiency.html`, `stacks.html`, `streaks.html`, `successrate.html`, `targetpremium.html`, `tdregression.html`, `workload.html`, `dualthreat.html`

These are all from the later build phases (131-140+). Earlier pages like `aging.html`, `awards.html`, etc. all have proper 480px breakpoints.

**Fix**: Add `@media (max-width: 480px)` rules to each page. Typical pattern: reduce h2 to 20px, reduce card padding to 10px, stack horizontal layouts vertical, reduce table font to 11px.

---

## TICKET 8: Situation Room (agents.html) dark mode hardcodes

**Severity**: LOW — Situation Room is always dark, but inconsistently so
**Design rule**: Situation Room uses `--bg-ink` (#1a110a) always dark

**Problem**: The agents.html page uses a mix of CSS variables and hardcoded dark values:
- `agents.html:314` — `rgba(26, 17, 10, 0.85)` hardcoded instead of using a CSS variable
- Several elements use correct `var(--ink)` but the page doesn't explicitly set `data-theme="dark"` or `.warroom-dark` scoping on its main container — it relies on inline dark styling in the `<style>` block

**Fix**: Apply `.warroom-dark` class from styles.css to the Situation Room container so all children inherit dark palette from CSS variables. Replace hardcoded rgba values with variable references.

---

## TICKET 9: Inconsistent hover shadow treatment (no hover lift on many cards)

**Severity**: LOW — Missing micro-interaction
**Design rule**: Cards hover → `6px 6px 0` + `translate(-2px, -2px)`

**Problem**: The design guide specifies that cards should lift on hover with `6px 6px 0` shadow + translate. Many standalone panel pages define cards with `3px 3px 0` or `4px 4px 0` shadows but have no `:hover` transition defined. Cards feel static/dead compared to the Lab and home page which have proper hover lift.

**Scope**: Audit all `.lp-card`, `.stat-card`, `.tool-card` classes in `lab-panels.css` and standalone HTML files for hover state. Add consistent `transition: box-shadow 0.15s, transform 0.15s` + hover rule.

**Fix**: Add a shared `.card-hover` utility class in `styles.css` or `lab-panels.css`:
```css
.card-hover { transition: box-shadow 0.15s, transform 0.15s; }
.card-hover:hover { box-shadow: 6px 6px 0 var(--ink); transform: translate(-2px, -2px); }
```

---

## TICKET 10: Print CSS uses hardcoded #fff background

**Severity**: LOW — Minor, print-only
**Design rule**: Use design tokens everywhere

**Problem**: `cheatsheet.html:227` uses `background: #fff` in `@media print` CSS. While this is only for printed output (where white paper makes sense), it's the only hardcoded `#fff` in any HTML/CSS file in the project.

**Fix**: Replace with `background: var(--bg-card)` or leave as-is with a `/* print: white paper */` comment to document the intentional exception. Low priority — only affects printed cheat sheets.

---

## Summary

| # | Ticket | Severity | Scope |
|---|--------|----------|-------|
| 1 | Normalize box-shadow offsets (3px/5px → 4px/6px) | HIGH | 44 hits, 25 files |
| 2 | Cold rgba(0,0,0) in shadows → warm espresso | HIGH | 6 hits, 2 files |
| 3 | Blur shadows → flat offset shadows | MEDIUM | 2 hits, 1 file |
| 4 | 1px borders → 2px minimum | MEDIUM | 16 hits, 6 files |
| 5 | Off-brand hex colors → design tokens | MEDIUM | 9 hits, 4 files |
| 6 | Cold rgba overlays → warm espresso | MEDIUM | 3 hits, 2 files |
| 7 | 19 pages missing 480px breakpoint | MEDIUM | 19 files |
| 8 | Situation Room dark mode hardcodes | LOW | 1 file |
| 9 | Missing hover lift on panel cards | LOW | lab-panels.css + pages |
| 10 | Print CSS hardcoded white | LOW | 1 hit, 1 file |
