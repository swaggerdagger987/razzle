# DQ-106: aspect-ratio missing on image containers — CLS risk on load

**Priority**: P3
**Category**: Performance / layout stability
**Severity**: Low — causes Cumulative Layout Shift (CLS) when images load
**Evidence**: Code search — 1 instance of `aspect-ratio` in entire frontend (agents.html pixel canvas only)

## What's wrong

When images load (player headshots, team logos, mascot), the browser doesn't know their dimensions until the image arrives. This causes layout shift — content below jumps down as images render. Modern CSS uses `aspect-ratio` on image containers to reserve space before load.

Only 1 file uses `aspect-ratio` (agents.html for the pixel canvas at `30/22`). Zero image containers have it.

## Where

- Player headshot circles (Lab table, dashboard cards, rankings chips, profile modals)
- Team logo images (team pages, matchup grids)
- Mascot image (home hero, bureau connect page)
- OG preview images

## Fix

Add `aspect-ratio: 1` to circular headshot containers (they're square crops rendered as circles):

```css
.player-headshot, .player-portrait {
  aspect-ratio: 1;
  width: 40px; /* or whatever the current size is */
  object-fit: cover;
}
```

For rectangular images (mascot, team logos), set the natural aspect ratio.

This prevents CLS on initial page load and image lazy-loading.

## Verification

Throttle network to Slow 3G. Load the dashboard. Content below player cards should not jump when headshots load.
