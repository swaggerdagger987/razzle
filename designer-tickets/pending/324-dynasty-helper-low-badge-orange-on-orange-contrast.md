# DES-324: Dynasty helper .dh-val.low badge — orange on orange-light = ~2.8:1 contrast

**Priority**: P2
**Area**: lab-panels.css (line ~364)
**Cycle**: 30

## Problem

The "low" value badge in the Dynasty Helper panel uses:

```css
.dh-val.low { background: var(--orange-light); color: var(--orange); }
```

- `--orange-light` = `#f7e4d8` (background)
- `--orange` = `#d97757` (text)
- **Contrast ratio: ~2.8:1** — fails WCAG AA for all text sizes

Other value badges in the same element pass:
- `.dh-val.solid` / `.dh-val.elite` / `.dh-val.rep` all use higher-contrast pairs

The "low" badge is the one users need to notice most — it flags players to trade away. Ironic that the warning badge is the hardest to read.

## Fix

Use a darker orange for text:

```css
.dh-val.low { background: var(--orange-light); color: #7a3718; }
```

`#7a3718` (a dark burnt orange) on `#f7e4d8` gives ~5.2:1 contrast — passes WCAG AA. This matches the pattern already used by `.tv-tier-num.t4` which has the same background.

Alternatively, define `--orange-dark: #7a3718` as a semantic token.

## Why This Matters

Dynasty Helper is a discovery tool — users scanning for roster moves need to spot "low value" players at a glance. A badge they can barely read defeats the purpose.
