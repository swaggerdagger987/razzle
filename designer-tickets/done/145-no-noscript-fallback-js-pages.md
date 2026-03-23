# DES-145: No noscript fallback on JS-dependent pages

**Priority:** P2 — Resilience / Conversion
**Component:** lab.html, league-intel.html, agents.html
**Affects:** Users with JS disabled, blocked, or failed to load

## Problem

Zero pages in the frontend have `<noscript>` tags. The Lab (lab.html), Bureau (league-intel.html), and Situation Room (agents.html) are 100% JS-rendered — if JavaScript fails to load (ad blockers, CDN issues, slow mobile connections, corporate firewalls), users see a completely blank page with no explanation.

This is especially relevant because:
- DES-129 already identified that the Sign In button fails silently if app.js doesn't load
- Ad blockers sometimes block `.js` files served from unfamiliar domains
- Slow 3G connections (common on mobile) may timeout on large JS bundles
- The user has no way to know WHY the page is blank

## Evidence

- Zero matches for `noscript` in any frontend file (confirmed via grep)
- `lab.html` — The #mainTable, filters, toolbar, sidebar are all JS-populated
- `league-intel.html` — All league data is JS-fetched and rendered
- `agents.html` — Pixel canvas and agent UI are entirely JS-driven

## Fix

Add a `<noscript>` block to the main content area of each JS-dependent page:

```html
<!-- lab.html, inside the main content area -->
<noscript>
  <div style="text-align:center; padding:48px 24px; font-family:var(--font-mono); color:var(--ink-medium);">
    <p style="font-family:var(--font-display); font-size:24px; margin-bottom:12px;">JavaScript required</p>
    <p>The Lab needs JavaScript to run. Please enable it or check your ad blocker.</p>
    <p style="font-family:var(--font-hand); font-size:18px; margin-top:16px; color:var(--ink-light);">
      pulling film requires electricity...
    </p>
  </div>
</noscript>
```

Use Razzle's voice — not a generic error. The loading state humor should extend to the "no JS" state.

## Why it matters

A blank page is the worst possible first impression. Even 1% of visitors hitting this (ad blockers, slow connections) represents lost potential users. A branded noscript message at least tells them what happened and how to fix it. It also improves SEO — search engines see content instead of empty divs.
