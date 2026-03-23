# DES-318: --ink-light as text color has systemic 3.1:1 contrast failure across 20+ elements

**Priority**: P1
**Area**: styles.css, lab-panels.css (sitewide)
**Cycle**: 30

## Problem

`var(--ink-light)` (#8a7565) is used as text color on `var(--bg-card)` (#f7efe5) and `var(--bg)` (#ede0cf) backgrounds throughout the site. Both pairs produce ~3.1:1 contrast — below WCAG AA's 4.5:1 requirement for normal text.

### Affected elements (non-exhaustive):

**styles.css:**
- `.nav-plan-free` (line ~502) — plan badge text
- `.input-chunky::placeholder` (line ~941) — all search/filter placeholders
- Nav dropdown labels, empty state messages, user menu labels

**lab-panels.css:**
- `.rankings-team` (line ~276) — 11px team labels
- `.rankings-ppg` (line ~289) — 11px PPG stats
- `.dh-team` (line ~356) — 10px dynasty helper team
- `.tv-tier-label` (line ~588) — tier annotations
- `.tv-tier-count` (line ~589) — tier count badges
- `.tv-rank` (line ~602) — player rank numbers
- `.tv-age` (line ~616) — age labels at 10px

These are DATA elements — stats, labels, ranks — the exact things users come to Razzle to read.

## Root Cause

`--ink-light` was designed for dividers, separators, and metadata borders. It's being used as a text color where `--ink-medium` (#5c4a3d, ~5.1:1 contrast) should be used instead.

## Fix

Audit every `color: var(--ink-light)` declaration. For text on light backgrounds:
- **Labels/stats at 12px+**: Change to `var(--ink-medium)` (~5.1:1)
- **Decorative/non-essential text**: Keep `var(--ink-light)` but ensure font-size is 18px+ (WCAG large text threshold is 3:1)
- **Placeholder text**: Change to `var(--ink-medium)` (placeholders are already hard to read)

## Why This Matters

Fantasy football users scan dense data tables. Low-contrast labels on a warm sand background are the exact scenario where readability drops. This affects the entire Lab experience — every panel, every table, every stat badge.
