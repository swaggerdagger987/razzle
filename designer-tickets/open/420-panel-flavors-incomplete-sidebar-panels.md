# DQ-420: PANEL_FLAVORS incomplete — many Lab sidebar panels have no subtitle

**Priority**: P2
**Category**: UX Consistency
**Files**: `frontend/lab.html` (PANEL_FLAVORS map, line ~4271+)

## Problem

The `PANEL_FLAVORS` map defines subtitle/flavor text for Lab panels (e.g., "who's worth the most in your league" for trade values). Only ~15 panels have flavor text defined. The remaining 50+ panels in the sidebar show no subtitle when selected, creating inconsistent UX.

When a panel has flavor text → user sees a helpful description under the panel title.
When a panel has no flavor text → the space is empty, looks incomplete.

## What the user sees

- Click "Trade Values" → subtitle: "who's worth the most in your league"
- Click "Snap Efficiency" → no subtitle, just the title
- Inconsistent experience across panels

## Fix

Complete the PANEL_FLAVORS map for all sidebar panels. Each flavor should be:
- One short sentence in Caveat font style
- Describes what the panel shows, not how to use it
- Matches the dry-wit personality from DESIGN.md

Example additions:
- snapefficiency: "who's doing the most with the least"
- tdregression: "separating skill from luck, one TD at a time"
- garbagetime: "stat padding exposed"
- dualthreat: "the best of both worlds"
