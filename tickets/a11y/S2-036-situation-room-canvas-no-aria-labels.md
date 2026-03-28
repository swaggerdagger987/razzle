---
id: S2-036
severity: S2
category: a11y
title: Situation Room pixel canvas has no ARIA labels or screen reader description
source: deep-audit
status: open
---

## Problem

The pixel canvas (30x22 tile grid with sprite agents) is interactive (click/touch agent selection) but has no ARIA labels, alt text, or screen reader equivalent. Canvas content is invisible to assistive technology.

## Root Cause

`frontend/agents.html` — the canvas element lacks `aria-label` and there is no visually hidden description for screen readers.

## Fix

1. Add `aria-label="Situation Room: six AI agents working in a pixel art office"` to the canvas element
2. Add a visually hidden `<p class="sr-only">` description listing the agents and their roles
3. Ensure the canvas container has `role="img"` since it's decorative/illustrative

## Accept When

- The canvas element has an appropriate `aria-label`
- Screen readers announce a meaningful description of the canvas content
- Interactive elements within the canvas are documented as keyboard-inaccessible (acceptable for decorative canvas)
