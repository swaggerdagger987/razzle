---
id: DES-269
title: Lab sidebar CATEGORY_AGENTS JS mapping disagrees with HTML agent icons
priority: P2
page: lab.html
category: agent-brand
cycle: 26
---

## Problem

The Lab sidebar has two sources of agent attribution: HTML `<img>` icons on category headers, and a JS `CATEGORY_AGENTS` object that maps categories to agent IDs for loading/empty state text. These disagree.

**Mismatch:**
- "Trends & Projections" — HTML (line 3244) shows `dolphin.svg` (Dr. Dolphin), but JS (line 4184) maps to `'atlas'` (Atlas/Historian). Paid users would see Dr. Dolphin's icon but hear Atlas's voice in loading states.

**Missing from JS mapping (3 categories):**
- "College" — HTML (line 3253) shows `hawkeye.svg`, but not in `CATEGORY_AGENTS`
- "Teams" — HTML (line 3282) shows `hawkeye.svg`, but not in `CATEGORY_AGENTS`
- "Player Tools" — HTML (line 3258) shows `atlas.svg`, but not in `CATEGORY_AGENTS`

These categories get agent icons in the sidebar but `_updateSidebarAgents()` won't add agent name badges for paid users.

## Evidence

- lab.html:3244 — `<img src="/assets/agents/dolphin.svg"...>` on "Trends & Projections"
- lab.html:4184 — `'Trends & Projections': 'atlas'`
- lab.html:4180-4186 — only 6 of 9 categories in mapping
- agent-config.js — dolphin.panels includes pace, seasonpace (in Trends & Projections)
- agent-config.js — atlas.panels includes career, career-compare (in Player Tools, not Trends)

## Fix

1. Change JS mapping: `'Trends & Projections': 'dolphin'` (matches HTML icon and agent-config territories)
2. Add missing categories to CATEGORY_AGENTS:
   - `'College': 'hawkeye'`
   - `'Teams': 'hawkeye'`
   - `'Player Tools': 'atlas'`

## Why This Matters

The agent connective tissue design (Layer 2) makes agents visibly own their sections. When icon and voice disagree, the "aha moment" ("Oh, the dolphin from the injury column IS Dr. Dolphin") breaks instead of connecting.
