# S1-024: 4 standalone pages reference undefined position CSS vars (--qb not --pos-qb)

**Severity**: S1 (High)
**Category**: design
**Source**: designer-tickets/DQ-051
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/styles.css:41-44` defines position colors as `--pos-qb`, `--pos-rb`, `--pos-wr`, `--pos-te`. However, 4 standalone HTML pages reference the short-form `--qb`, `--rb`, `--wr`, `--te` which don't exist. All 37 affected CSS rules silently fail — position badges, scarcity bars, tier labels, and archetype badges render with no color.

## Affected Files (37 rules total)

**dashboard.html** (11 rules):
- Lines 175-178: `.db-pos.{QB,RB,WR,TE}` background
- Lines 190,193: `.db-chip.{up,ppg}` color + border-color
- Lines 222-225: `.db-scar-bar.{QB,RB,WR,TE}` background
- Lines 253-256: `.db-trend-pos.{QB,RB,WR,TE}` color

**auction.html** (12 rules):
- Lines 132-135: `.av-sum-pos.{QB,RB,WR,TE}` color
- Lines 190-193: `.av-pos-badge.{QB,RB,WR,TE}` background
- Lines 203-204: `.av-dollar.{value,bargain}` color
- Lines 234-235: `.av-tier-badge.{value,bargain}` color + border-color

**archetypes.html** (8 rules):
- Lines 150-153: `.ar-arch-badge.{QB,RB,WR,TE}` color + border-color
- Lines 217-220: `.ar-pos-sm.{QB,RB,WR,TE}` background

**tiers.html** (6 rules):
- Lines 159-160: `.tl-tier-label.{C,D}` background
- Lines 202-205: `.tl-chip-pos.{QB,RB,WR,TE}` background

**index.html** (2 rules, lower priority):
- Lines 502, 506: `.pricing-card--free` and `.pricing-badge--free` use `var(--rb)`

## Fix

Find-replace across all 4 files:
- `var(--qb)` → `var(--pos-qb)`
- `var(--rb)` → `var(--pos-rb)`
- `var(--wr)` → `var(--pos-wr)`
- `var(--te)` → `var(--pos-te)`

For index.html pricing card, decide if it should use `var(--pos-rb)` or a different design token.

## Accept When

1. `grep -r "var(--qb)" frontend/ --include="*.html"` returns zero results
2. Same for `--rb`, `--wr`, `--te` (excluding `--pos-*` versions)
3. Position badges on dashboard, tiers, auction, archetypes pages show correct colors

## Do NOT Touch

- `styles.css` variable definitions — those are correct
- `lab-panels.css` / `lab-panels.js` — those already use correct `--pos-*` vars
