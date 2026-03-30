# DES-132: lab-panels.js never uses agent-voiced loading/empty/error text

**Priority:** P2 — Agent Connective Tissue
**Component:** lab-panels.js, agent-config.js
**Affects:** All 70+ Lab panels

## Problem

`agent-config.js` defines `getLoadingText()`, `getEmptyText()`, and `getErrorText()` functions that return agent-voiced copy based on panel ownership. The main screener in `lab.js` uses these functions correctly (lines 1356, 1404, 1451, 2012).

But `lab-panels.js` — which renders ALL 70+ individual Lab panels — has **zero calls** to any of these functions. Every panel uses hardcoded generic text for loading/empty/error states instead of the agent-specific personality copy.

When a user opens the "Breakout Finder" panel (Hawkeye's domain), they should see "scanning the tape..." — not generic "pulling film...". When "Efficiency Rankings" (Octo's domain) returns no data, it should say "Insufficient data. Octo needs more." — not a generic empty message.

## Evidence

- `grep -c 'getLoadingText\|getEmptyText\|getErrorText' frontend/lab-panels.js` → **0 results**
- `agent-config.js:218-234` — three helper functions defined and exported
- `lab.js:1356` — uses `getErrorText('screener')` ✓
- `lab.js:2012` — uses `getEmptyText('screener')` ✓
- `lab-panels.js` — 4000+ lines, **zero agent-voiced function calls**

## Fix

In `lab-panels.js`, for each panel's fetch/render lifecycle:
1. **Loading**: Replace generic loading text with `getLoadingText(panelId)`
2. **Empty**: Replace generic empty messages with `getEmptyText(panelId)`
3. **Error**: Replace generic error messages with `getErrorText(panelId)`

The `panelId` is already available as the panel's identifier when rendering.

## Why it matters

The agent personality is the differentiator. Every other fantasy tool has generic "Loading..." text. Razzle's agents should feel present everywhere — especially in the panels they own. This is Layer 1 (Personality, Free) connective tissue that free users feel without realizing it.
