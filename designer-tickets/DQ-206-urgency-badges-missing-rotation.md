---
id: DQ-206
priority: P2
category: visual language
status: open
---

# Urgency badges (URGENT/MONITOR/OPPORTUNITY) missing sticker rotation

## Problem

DESIGN.md line 161: "Tier Stickers: slightly rotated (`rotate(3deg)`) — slapped on, not placed." The urgency badges on Situation Room briefing cards are styled as sticker-like pills (2px border, 20px radius, 2px shadow) but have ZERO rotation. They sit perfectly straight, looking mechanical.

This is distinct from DQ-033 (tier letter badges on tiers.html) and DQ-034 (rankings tier badges). This is specifically about the URGENT/MONITOR/OPPORTUNITY badges on agent briefing cards.

## Evidence

agents.html lines 985-1001:
```css
.briefing-card-body .urgency-badge {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 11px;
  text-transform: uppercase;
  padding: 2px 10px;
  border: 2px solid var(--ink);
  border-radius: 20px;
  box-shadow: 2px 2px 0 var(--ink);
  /* NO transform: rotate() */
}
```

## Fix

Add slight rotation to urgency badges:
```css
.briefing-card-body .urgency-badge {
  transform: rotate(-2deg);
}
```

Use alternating rotation for visual variety if multiple badges appear:
```css
.urgency-badge:nth-child(odd) { transform: rotate(-2deg); }
.urgency-badge:nth-child(even) { transform: rotate(2deg); }
```

## Files
- `frontend/agents.html` line 985
