# DES-042: color: white / #fff hardcoded in 69 HTML files (121 instances)

**Priority**: P2
**Area**: sitewide (69 HTML pages, per-page `<style>` blocks)
**Impact**: Position badges, tier badges, and grade badges across 69 standalone HTML pages use hardcoded `color: white` or `color: #fff`. Combined with DES-032 (96 instances in lab-panels.css), the total is 217 hardcoded white text instances sitewide. The `--text-on-accent` CSS variable exists but isn't used.

## The Problem

Grep found 121 occurrences of `color: white` or `color:#fff` across 69 HTML files. These are in per-page `<style>` blocks — not the shared stylesheet.

**Highest-count files:**
- lab.html: 15 instances (player profile inline badges, breakout badges, college badges)
- index.html: 6 instances (home page position badges, hero elements)
- rankings.html: 6 instances (dynasty ranking badges)
- career.html: 3 instances
- percentiles.html: 3 instances
- tiers.html: 3 instances

**Common pattern:**
```css
.pos-badge { color: white; background: var(--pos-qb); }
.tier-badge { color: #fff; background: var(--orange); }
.grade-badge { color: white; background: var(--green); }
```

The `--text-on-accent` variable is defined in `:root` (line 68 of styles.css):
- Light mode: `white`
- Dark mode: `var(--bg)` = espresso brown

## The Fix

Replace all `color: white` and `color: #fff` on accent-background badges with `color: var(--text-on-accent)`.

**Note:** For badges on vibrant accent backgrounds (position colors), white may actually be better than espresso brown in dark mode. Test contrast ratios:
- White on `#5b7fff` (QB blue): 3.5:1 — passes AA large
- `#2d1f14` on `#5b7fff`: 4.8:1 — also passes

Both work, but `var(--text-on-accent)` is the principled approach. If contrast is an issue, update the dark mode value of `--text-on-accent` to `white` instead of `var(--bg)`.

## Why This Matters

217 hardcoded color values = 217 places where theme changes require manual audits. The `--text-on-accent` variable was created to solve exactly this problem. Not using it defeats the purpose of having a design token system.
