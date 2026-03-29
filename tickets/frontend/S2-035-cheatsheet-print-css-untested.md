---
id: S2-035
severity: S2
category: frontend
title: Cheat sheet print CSS may not produce clean draft board — needs verification
source: deep-audit
status: open
---

## Problem

The cheat sheet has `@media print` CSS for printing draft boards. This is a high-value feature for draft day but may not have been tested recently. Broken print CSS on draft day would be frustrating.

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

**Print CSS block** — `frontend/cheatsheet.html:218-228`:
- Line 220: `.topnav, footer, .cs-controls, .cs-actions, .watermark { display: none !important; }` — hides nav, controls, watermark
- Line 221: `.cs-page { padding: 0; max-width: 100%; }` — full-width for paper
- Line 222: `.cs-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }` — maintains 4-col layout, tightens gap (14px → 8px)
- Line 223: `.cs-col { box-shadow: none; border-width: 2px; }` — removes shadows, thins borders
- Line 224: `.cs-header { margin-bottom: 10px; }` — reduces header margin
- Line 225: `.cs-header h1 { font-size: 24px; }` — reduces title (32px → 24px)
- Line 226: `.cs-player { padding: 3px 6px; font-size: 10px; }` — compact player rows (11px → 10px)
- Line 227: `body { background: #fff; }` — forces white background

**Print button** — `frontend/cheatsheet.html:272`: `<button onclick="window.print()">Print</button>` in `.cs-actions` div

**Screen grid** — `frontend/cheatsheet.html:95-100`: `grid-template-columns: repeat(4, 1fr); gap: 14px;`

**Assessment**: Print CSS exists and is structurally sound. The concern is whether it has been visually tested recently — font sizes and margins may not fit all draft formats on US Letter paper. This is a verification task, not a code fix.

## Fix

1. Open cheatsheet.html in browser, select each draft format, and use Ctrl+P to verify print preview
2. Verify the 4-column position grid renders correctly on US Letter paper
3. Verify tier breaks are visible in print
4. If player rows clip or overflow, adjust `font-size` at line 226 (currently 10px)

## Accept When

- Print CSS produces a clean, usable draft board on US Letter paper
- All 4 position columns are visible without cutoff
- Tier breaks and player names are legible
