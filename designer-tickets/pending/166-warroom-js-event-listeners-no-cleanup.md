# DES-166: warroom.js has 30 addEventListener calls with 0 removeEventListener

**Priority**: P2 (Performance — Situation Room memory leak)
**Page**: agents.html (Situation Room)
**Category**: Performance UX

## The Problem

`warroom.js` calls `addEventListener` 30 times but `removeEventListener` zero times. The Situation Room has a pixel canvas with animation loops, keyboard handlers, click handlers, and resize listeners — all accumulating without cleanup.

Unlike lab-panels.js (DES-157) which affects the free growth engine, this affects the paid Situation Room. But it's the premium product — performance problems here directly undermine the value proposition that justifies $9.99/mo.

## Evidence

- `addEventListener` count in warroom.js: **30**
- `removeEventListener` count in warroom.js: **0**
- Includes: keyboard listeners, mouse/click handlers, resize observers, animation frame callbacks
- The pixel canvas runs a continuous animation loop — orphaned listeners compound with every interaction

## The Fix

1. For the canvas animation loop: ensure `requestAnimationFrame` has a proper cancel mechanism when navigating away
2. For keyboard/mouse listeners on `document` or `window`: store references and remove in a cleanup function
3. For resize listeners: use a single resize handler, or debounce to prevent rapid-fire reflows
4. Consider using `AbortController` with `signal` parameter on addEventListener for batch cleanup:
   ```js
   const controller = new AbortController();
   document.addEventListener('keydown', handler, { signal: controller.signal });
   // On cleanup:
   controller.abort(); // removes all listeners registered with this signal
   ```

## Why This Matters

A Pro/Elite user running a Situation Room AI briefing session with 6 agents generating responses, pixel animations running, and cross-agent triggers firing — that's an intensive page. Memory leaks from 30 orphaned listeners per session cause the page to slow down during the exact moment the user is evaluating whether the premium features are worth paying for.
