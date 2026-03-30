---
id: DES-295
title: Hover card positioning triggers 3 forced reflows — may cause jank on low-end devices
severity: P3
category: Performance/UX
page: lab.html
---

## What's Wrong

The player hover card positioning code at lab.js lines 2232-2243 forces 3 layout recalculations in sequence:

```js
const cw = card.offsetWidth || 260;   // Reflow #1
const ch = card.offsetHeight || 160;  // Reflow #2
// ... position writes ...
card.style.display = "block";         // Write
card.offsetHeight;                    // Reflow #3 (intentional, for animation)
card.classList.add("visible");
```

On fast machines this is invisible, but on budget Android phones (significant portion of fantasy football users during live drafts), the triple reflow can cause visible flicker when hovering rapidly over player rows.

## Where

- `frontend/lab.js` lines 2232-2243: `showHoverCard()` function

## Fix

Consolidate to a single reflow:
```js
card.style.display = "block";
// Single read pass
const cw = card.offsetWidth || 260;
const ch = card.offsetHeight || 160;
// Position writes
card.style.top = top + "px";
card.style.left = left + "px";
// Animation trigger (still 1 reflow, but batched)
requestAnimationFrame(() => card.classList.add("visible"));
```

Using `requestAnimationFrame` for the animation trigger avoids the explicit `card.offsetHeight` forced reflow.

## Evidence

Lines 2232-2233 read `offsetWidth`/`offsetHeight` BEFORE `display:block` (line 2240), so they get stale values (0 or cached) — the `|| 260` fallback confirms this. Then line 2242 forces another reflow explicitly. Reordering the reads after the display write and using rAF eliminates 2 of 3 reflows.
