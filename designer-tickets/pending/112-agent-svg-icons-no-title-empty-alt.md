# DES-112: Agent SVG icons have no `<title>` and are always used with empty `alt`

**Priority**: P2 — agent identity is invisible to screen readers
**Category**: Screen reader accessibility, Agent connective tissue
**WCAG**: 1.1.1 (Non-text Content)

## Problem

The 6 agent SVG icon files at `/assets/agents/` contain no `<title>` element:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#d97757">
  <!-- Tiger face: round head + ears + stripes -->
  <circle cx="10" cy="11" r="7"/>
  ...
</svg>
```

Every `<img>` tag that references these icons uses `alt=""`, treating them as decorative:
- `agents.html` line 1624: `<img src="/assets/agents/razzle.svg" width="28" height="28" alt="">`
- `lab.html` line 4188: `'<img src="' + agent.icon + '" width="12" height="12" alt="">'`

Agent icons carry identity — they represent Dr. Dolphin, Hawkeye, Bones, Octo, Atlas, and Razzle. The agent connective tissue design (docs/plans/2026-03-20) explicitly describes these as "16px avatar icons next to columns and panel headers in their domain." The identity IS the point.

## Files

**SVGs (6 files):** `frontend/assets/agents/atlas.svg`, `bones.svg`, `dolphin.svg`, `hawkeye.svg`, `octo.svg`, `razzle.svg`

**Usage locations:**
- `frontend/agents.html` line 1624 (Razzle avatar in briefing header)
- `frontend/lab.html` line 4188 (sidebar panel attribution badge)
- `frontend/lab.html` line 4459 (panel agent one-liner)

## Fix

1. Add `<title>` to each SVG file:
   ```svg
   <svg ...>
     <title>Razzle</title>
     ...
   </svg>
   ```
2. Use meaningful `alt` text where the icon carries identity:
   ```html
   <img src="/assets/agents/razzle.svg" alt="Razzle" width="28" height="28">
   ```
3. Keep `alt=""` ONLY where the agent name is already in adjacent text (e.g., sidebar badge where name follows the icon).

## Why This Matters

The agent connective tissue design is the product's differentiator — the band of agents that ties Lab, Bureau, and Situation Room together. If screen reader users can't perceive agent identity from the icons, the "earned discovery" experience described in the design plan doesn't work for them.
