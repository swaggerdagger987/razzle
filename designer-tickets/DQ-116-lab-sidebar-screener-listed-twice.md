# DQ-116: Lab sidebar lists "The Screener" twice — confusing redundancy

**Priority**: P2 (UX / information architecture)
**Category**: Navigation
**Severity**: Medium — confuses new users about whether these are the same thing

## Problem

The Lab right sidebar shows "The Screener" in TWO places:

1. Under **"START HERE"** section (onboarding recommendations):
   - The Screener — "the research lab"
   - Dynasty Rankings — "know what your roster is worth"
   - Trade Values — "every player's trade stock"
   - Breakout Finder — "find your next sleeper"
   - Compare — "head-to-head matchups"

2. Under **"FOREVER FREE"** section (categorized panel list):
   - **The Screener** (highlighted as active, with orange bar)
   - Dynasty Rankings
   - Tiers
   - Trade Values
   - ...etc

A new user scrolling the sidebar sees "The Screener" at the top of START HERE, then scrolls down and sees "The Screener" again in FOREVER FREE — with a highlighted active state. It's unclear whether these are the same panel or different things. The duplication undermines the sidebar's navigational clarity.

## Screenshot evidence

Lab sidebar zoom (light mode) shows both entries ~5 panel-links apart, both with star icons.

## Fix

Remove "The Screener" from the START HERE section. START HERE should only list PANELS that are NOT the screener — it should guide users to discovery panels they might not find on their own. The screener is already the default active view and doesn't need a START HERE listing. Alternatively, make START HERE a collapsible section that auto-hides after first visit (localStorage flag).

## Not a duplicate of

- No existing DQ ticket covers sidebar information architecture
