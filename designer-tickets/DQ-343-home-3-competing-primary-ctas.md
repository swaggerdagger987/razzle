---
id: DQ-343
title: Home page has 3 competing btn-hero-primary CTAs — broken visual hierarchy
priority: P2
category: UX / conversion
page: index.html
cycle: 45
---

## Problem

The home page has THREE orange `btn-hero-primary` buttons:
1. Line 647: "Open the Screener" (hero section — correct, this is THE CTA)
2. Line 683: "Open the full Screener" (mini-screener section)
3. Line 755: "Connect your league" (Bureau section)

All three are orange-filled with 3px ink border and 4px shadow. They compete for visual attention. The hero CTA should be the loudest; section CTAs should be secondary.

DESIGN.md: "Buttons should have clear hierarchy — one primary action, secondaries less aggressive."

## Evidence

```html
<!-- Line 647 — correct -->
<a href="/lab.html" class="btn-hero btn-hero-primary">Open the Screener</a>

<!-- Line 683 — should be secondary -->
<a href="/lab.html" class="btn-hero btn-hero-primary" style="font-size:14px; ...">Open the full Screener</a>

<!-- Line 755 — should be secondary -->
<a href="/league-intel.html" class="btn-hero btn-hero-primary" style="font-size:14px; ...">Connect your league</a>
```

## Fix

Change section CTAs from `btn-hero-primary` to `btn-hero-secondary`:
```html
<a href="/lab.html" class="btn-hero btn-hero-secondary">Open the full Screener</a>
<a href="/league-intel.html" class="btn-hero btn-hero-secondary">Connect your league</a>
```

Hero section keeps btn-hero-primary. Everything else is secondary.

## Files
- `frontend/index.html` (lines 683, 755)
