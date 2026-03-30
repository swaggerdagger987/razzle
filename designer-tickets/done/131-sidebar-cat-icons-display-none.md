# DES-131: Lab sidebar category icons hidden via display:none

**Priority:** P2 — Agent Connective Tissue
**Component:** lab.html
**Affects:** Lab sidebar — agent attribution (Layer 2)

## Problem

The Lab sidebar has 12 `.cat-icon` span elements that are ALL hardcoded to `display:none`. These were intended to show category icons but are completely invisible. Per the agent connective tissue design doc, sidebar categories should show agent icons (16-20px) to signal which agent owns each panel group.

The icons exist in the HTML. The agent SVG files exist at `/assets/agents/`. The `AGENT_TERRITORY` mapping is defined in `agent-config.js`. But the sidebar icons are CSS-hidden and still use generic emoji placeholders instead of agent SVGs.

## Evidence

- `lab.html:3182-3271` — 12 `.cat-icon` spans, ALL with `style="display:none"`:
  - Line 3182: `★` (FOREVER FREE)
  - Line 3186: `☆` (FREE PANELS)
  - Line 3200: `📊` (Rankings & Values) — should be Bones (diplomat icon)
  - Line 3211: `📈` (Performance) — should be Octo (quant icon)
  - Line 3223: `🏈` (Game Analysis) — should be Hawkeye (scout icon)
  - etc.
- `agent-config.js:9,38,66,93,119,145` — agent icons defined (dolphin.svg, hawkeye.svg, etc.)
- `frontend/assets/agents/` — all 6 SVG files confirmed to exist

## Fix

1. Remove `display:none` from `.cat-icon` spans
2. Replace emoji content with `<img>` tags pointing to the agent SVGs for the appropriate territory:
   - Rankings & Values → Bones (`/assets/agents/bones.svg`)
   - Performance → Octo (`/assets/agents/octo.svg`)
   - Game Analysis → Hawkeye (`/assets/agents/hawkeye.svg`)
   - Trends & Projections → Dr. Dolphin (`/assets/agents/dolphin.svg`)
   - etc. per `AGENT_TERRITORY` config
3. Style: `width:16px; height:16px; vertical-align:middle; margin-right:4px; opacity:0.6`

## Why it matters

Agent connective tissue Layer 2 says users should "start connecting the dots" — seeing that Hawkeye owns Usage panels and Octo owns Efficiency. This connection drives Pro conversion: users realize they're unlocking a team of experts, not just more panels. The sidebar is where this realization happens, and it's completely dark right now.
