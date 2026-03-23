---
id: DQ-051
priority: P1
category: broken colors
pages: dashboard.html, tiers.html, auction.html, archetypes.html
status: open
---

# 4 standalone pages reference undefined CSS position color variables

## What's wrong

32 CSS rules across 4 files reference `var(--qb)`, `var(--rb)`, `var(--wr)`, `var(--te)` — but these variables are **never defined anywhere**. The correct variable names are `var(--pos-qb)`, `var(--pos-rb)`, `var(--pos-wr)`, `var(--pos-te)` (defined in styles.css lines 41-44).

Since the variables are undefined, every position badge, position bar, and position-colored chip in these 4 pages silently renders with **no color** (transparent background).

## Evidence

Confirmed via `grep --qb: ` across entire frontend/ — zero definitions found.

**dashboard.html** (6 rules):
- Line 175-178: `.db-pos.QB/RB/WR/TE { background: var(--qb/--rb/--wr/--te); }`
- Line 190: `.db-chip.up { color: var(--rb); border-color: var(--rb); }`
- Line 193: `.db-chip.ppg { color: var(--qb); border-color: var(--qb); }`
- Line 222-225: `.db-scar-bar.QB/RB/WR/TE { background: var(--qb/--rb/--wr/--te); }`
- Line 253-256: `.db-trend-pos.QB/RB/WR/TE { color: var(--qb/--rb/--wr/--te); }`

**tiers.html** (6 rules):
- Line 152: `.tl-tier-label.C { background: var(--rb); }` — C tier label invisible
- Line 153: `.tl-tier-label.D { background: var(--qb); }` — D tier label invisible
- Line 195-198: `.tl-chip-pos.QB/RB/WR/TE { background: var(--qb/--rb/--wr/--te); }`

**auction.html** (12 rules):
- Line 132-135: `.av-sum-pos.QB/RB/WR/TE { color: var(--qb/--rb/--wr/--te); }`
- Line 190-193: `.av-pos-badge.QB/RB/WR/TE { background: var(--qb/--rb/--wr/--te); }`
- Line 203-204: `.av-dollar.value/bargain { color: var(--rb/--qb); }`
- Line 234-235: `.av-tier-badge.value/bargain` border-color + color

**archetypes.html** (8 rules):
- Line 150-153: `.ar-arch-badge.QB/RB/WR/TE { color: var(--qb/--rb/--wr/--te); border-color: var(--qb/--rb/--wr/--te); }`
- Line 217-220: `.ar-pos-sm.QB/RB/WR/TE { background: var(--qb/--rb/--wr/--te); }`

## Fix

Find-and-replace in all 4 files:
- `var(--qb)` -> `var(--pos-qb)`
- `var(--rb)` -> `var(--pos-rb)`
- `var(--wr)` -> `var(--pos-wr)`
- `var(--te)` -> `var(--pos-te)`

## Files
- `frontend/dashboard.html`
- `frontend/tiers.html`
- `frontend/auction.html`
- `frontend/archetypes.html`
