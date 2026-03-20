---
id: 20260320-170022-022
severity: P2
confidence: HIGH
flow: global
flow_name: Global — Ambient Character Presence
found_by: Backlog
date: 2026-03-20
status: TODO
type: structural
---

## Build ambient character presence with random agent peeking from margins

**PRIORITY: P2** | **Type: structural**
**Page**: all pages
**Design doc**: docs/DESIGN.md

Add subtle delight by having Razzle agents occasionally peek from the edges of the page — a character sprite partially visible at the margin, as if watching the user work. This should be rare (10-15% chance on page load), non-intrusive (does not shift layout), and dismissible (clicking hides it). Different agents appear on different pages (Hawkeye on Lab, Bones on Bureau, etc.). The peek animation should be a gentle slide-in from the edge.

### Task 1: Implement ambient character peek system
**Accept when**: On roughly 1 in 7 page loads, a character sprite peeks from the right margin of the page. The character is contextual to the page (Hawkeye on Lab, Bones on Bureau, Razzle on landing). Clicking the character hides it with a slide-out animation. The character does not affect page layout or shift content. A CSS class controls the animation. The feature can be disabled via a localStorage preference.
