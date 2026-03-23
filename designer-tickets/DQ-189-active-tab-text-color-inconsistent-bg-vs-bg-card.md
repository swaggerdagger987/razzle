---
id: DQ-189
priority: P3
category: css-consistency
status: open
cycle: 27
---

# Active tab text color inconsistent — `var(--bg)` vs `var(--bg-card)` across 15 pages

## What's wrong

When a position tab is active, the text color should be consistent across all pages. Currently:
- 11 pages use `color: var(--bg)` → `#ede0cf` (sand)
- 4 pages use `color: var(--bg-card)` → `#f7efe5` (cream)

These are different colors. On a dark `--ink` background:
- `--bg` (#ede0cf) has slightly lower contrast than `--bg-card` (#f7efe5)
- The difference is subtle (~3% lightness) but creates visual inconsistency when navigating

## Where

**Using `var(--bg)` (11 pages):**
advantage, drops, dualthreat, garbagetime, gamescript, records, seasonpace, snapefficiency, successrate, targetpremium, tdregression, workload

**Using `var(--bg-card)` (4 pages):**
archetypes, draftclass, weeklyleaders + (auction uses different pattern)

## Fix

Standardize on `color: var(--bg-card)` for all active tabs (higher contrast, slightly brighter):

```css
.pos-tab.active { background: var(--ink); color: var(--bg-card); }
```

Or better: if DQ-188 is implemented (position-colored active tabs), the text color should be `var(--text-on-accent)` or `#fff` for maximum contrast against saturated position colors.

## Test

1. Open advantage.html and archetypes.html side by side.
2. Click a position tab on each.
3. Active tab text color should be identical on both pages.
