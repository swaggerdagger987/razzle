# DES-286: agents.html "recommended" badge uses color:var(--bg) — breaks in dark mode

**Priority**: P2
**Page**: agents.html (Situation Room)
**Affects**: Dark mode users viewing Elite pricing card

## Problem

The "recommended" badge on the Elite pricing card (agents.html line 1937) uses `color:var(--bg)` for text on an orange background:

```html
<div style="... background:var(--orange); color:var(--bg); ...">recommended</div>
```

- **Light mode**: `var(--bg)` = `#ede0cf` (sand) on orange `#d97757`. Light text on orange. Fine.
- **Dark mode**: `var(--bg)` = `#2d1f14` (espresso) on orange `#d97757`. Dark brown text on orange. Poor contrast (~2.5:1 vs WCAG AA 4.5:1).

The codebase has `var(--text-on-accent)` specifically for this purpose — text on colored backgrounds that needs reliable contrast in both modes. The pricing.html badges correctly use it (line 99: `color: var(--text-on-accent)`).

## Evidence

```
agents.html:1937 → color:var(--bg)    ← WRONG
pricing.html:99  → color: var(--text-on-accent)  ← CORRECT
```

## Fix

Replace `color:var(--bg)` with `color:var(--text-on-accent)` in the badge inline style.

One-word fix.

## Why This Matters

The "recommended" badge is the visual signal that nudges users toward Elite (higher revenue tier). If it's unreadable in dark mode, Elite-curious users miss the cue. The correct pattern exists on pricing.html — this is a copy-paste gap.
