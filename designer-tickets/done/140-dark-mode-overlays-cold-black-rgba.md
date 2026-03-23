# DES-140: Dark mode overlays use cold black rgba(0,0,0) instead of warm espresso

**Priority:** P2 — Brand / Design System
**Component:** styles.css
**Affects:** Mobile nav overlay, auth modal overlay, command palette backdrop

## Problem

Three dark-mode overlay selectors use `rgba(0,0,0,...)` — pure cold black — instead of the warm espresso palette. DESIGN.md explicitly states: "Don't: Cold grays anywhere — even dark mode stays warm (brown, not gray)."

The light mode overlay correctly uses `rgba(45,31,20,0.4)` (warm espresso). But the dark mode overrides switch to cold black:

- `[data-theme="dark"] .mobile-nav-overlay { background: rgba(0,0,0,0.5); }` (line 275)
- `[data-theme="dark"] .auth-modal-overlay { background: rgba(0,0,0,0.6); }` (line 649)
- `[data-theme="dark"] .cmd-palette-backdrop { background: rgba(0,0,0,0.55); }` (line 1067)

When a dark mode user opens the auth modal or mobile nav, the backdrop flashes cold black instead of staying in the warm espresso family. It's the same feeling as a random gray element on the sand background — it breaks the "one material" illusion.

## Evidence

- `frontend/styles.css:272` — Light mode: `background: rgba(45,31,20,0.4);` (warm, correct)
- `frontend/styles.css:275` — Dark mode: `rgba(0,0,0,0.5)` (cold black)
- `frontend/styles.css:649` — Dark mode: `rgba(0,0,0,0.6)` (cold black)
- `frontend/styles.css:1067` — Dark mode: `rgba(0,0,0,0.55)` (cold black)
- `docs/DESIGN.md:238` — "Don't: Cold grays anywhere — even dark mode stays warm (brown, not gray)"

## Fix

Replace the three dark mode overlay backgrounds with warm dark espresso:

```css
[data-theme="dark"] .mobile-nav-overlay { background: rgba(26,17,10,0.6); }
[data-theme="dark"] .auth-modal-overlay { background: rgba(26,17,10,0.7); }
[data-theme="dark"] .cmd-palette-backdrop { background: rgba(26,17,10,0.65); }
```

`rgba(26,17,10,...)` is `#1a110a` (the `--bg-ink` Situation Room dark) at partial opacity — the warmest dark in the palette.

## Why it matters

The "warm everywhere" philosophy is the brand's visual signature. Cold black overlays break that warmth in the highest-attention moments — sign-in and mobile navigation. These are the exact moments where trust matters.
