---
id: DQ-358
priority: P2
area: frontend/lab-panels.css + 5 standalone pages
section: table hover states
type: color token violation (systemic)
status: open
---

# 40+ table hover backgrounds hardcode rgba(217,119,87) instead of CSS var

## What's wrong

40+ table row hover rules use `background: rgba(217,119,87,0.08)` — the raw RGB of `--orange` (`#d97757`). These won't respond to future theme changes and can't be maintained centrally.

DQ-036 ticketed 1 instance (dashboard.html). DQ-058 ticketed 2 instances (archetypes/auction badges). The remaining 37+ are unticketed.

## Where

**lab-panels.css** (30+ instances):
Lines 403, 759, 785, 1467, 1694, 1912, 1947, 1986, 2023, 2061, 2100, 2217, 2351, 2403, 2474, 2529, 2583, 2622, 2690, 2710, 2770, 2798, 2825, 2884, 2938, 2942, 2967, 2991, 3061, 3125, 3131

**Standalone pages** (5+ instances):
- advantage.html:54
- comptable.html:192
- drops.html:53
- playoffs.html:143
- auction.html:177

**Other files**:
- lab.js:1901 (data bar)
- warroom.js:3228 (upsell block)

## Suggested fix

Define `--orange-hover: rgba(217,119,87,0.08)` in `:root` (and a dark mode override), then find-and-replace all 40+ instances:

```css
/* :root */
--orange-hover: rgba(217,119,87,0.08);

/* [data-theme="dark"] */
--orange-hover: rgba(217,119,87,0.12);
```

Then replace every `background: rgba(217,119,87,0.08)` with `background: var(--orange-hover)`.

One CSS variable, one find-and-replace, 40+ files fixed.

## Why this matters

This is the single largest remaining token violation. Dark mode hover tint may be invisible on dark backgrounds. Centralized variable makes future adjustments trivial.
