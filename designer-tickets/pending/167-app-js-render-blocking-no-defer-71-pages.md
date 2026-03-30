# DES-167: app.js loaded without defer on all 71 HTML pages

**Priority**: P1
**Category**: Performance
**Affects**: Every page — index.html, lab.html, pricing.html, agents.html, league-intel.html, 66 standalone panel pages
**Cycle**: 16

## Problem

`app.js` (1,965 lines) is loaded as a render-blocking `<script src="app.js"></script>` on all 71 HTML pages. The browser must download, parse, and execute this entire file before rendering any page content. This blocks First Contentful Paint on every page.

Lab.html correctly uses `defer` for its 5 large scripts (lab.js, formulas.js, formula-store.js, charts.js, lab-panels.js) — but `app.js`, the shared core loaded on every page, is never deferred anywhere.

## Evidence

`index.html:916`:
```html
<script src="app.js"></script>
```

`lab.html:4038-4045`:
```html
<script src="app.js"></script>            <!-- ← NO defer -->
<script src="agent-config.js"></script>   <!-- ← NO defer -->
<script src="agent-nudges.js"></script>   <!-- ← NO defer -->
<script defer src="lab.js"></script>      <!-- ← defer ✓ -->
<script defer src="formulas.js"></script> <!-- ← defer ✓ -->
```

Total render-blocking JS on lab.html: app.js (1,965) + agent-config.js (240) + agent-nudges.js (215) = **2,420 lines** blocking first paint.

## Fix

Add `defer` to `app.js`, `agent-config.js`, and `agent-nudges.js` across all 71 pages:

```html
<script defer src="app.js"></script>
```

Verify that `DOMContentLoaded` listeners in app.js (line 90, 289, 1627, 1634) still fire correctly with `defer` — they will, since `defer` scripts execute before `DOMContentLoaded`.

## Why it matters

Performance is a first impression. Twitter/Reddit traffic is 62% mobile — slow first paint = bounce. Every 100ms of delay costs conversions. This is the single highest-leverage performance fix: one attribute change, 71 pages faster.
