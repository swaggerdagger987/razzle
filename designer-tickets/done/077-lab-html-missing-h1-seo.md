# DES-077: lab.html missing h1 element — SEO critical

**Priority**: P1
**Area**: frontend/lab.html (the Screener — flagship page)
**Cycle**: 8

## Problem

The Screener page (`lab.html`) has zero `<h1>` elements. It's the most-trafficked page on the site and the growth engine for the entire product. Search engines use `<h1>` as a primary heading signal. Without it, the page has no semantic heading structure — only `<h3>` tags inside modals.

Every other page in the codebase has exactly one `<h1>`. Five pages are missing them entirely: `lab.html`, `player.html`, `compare.html`, `league-intel.html`, and `404.html`. Of these, `lab.html` is the highest priority because it's the front door.

## Fix

Add a visually hidden h1 to the screener toolbar area:

```html
<h1 class="sr-only">Razzle Screener — Fantasy Football Research Lab</h1>
```

With the CSS:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

Or, make the existing "The Lab" / "Screener" text in the toolbar an h1 with appropriate styling to maintain the current visual layout.

Also add h1 to:
- `player.html` — set player name as h1 dynamically after fetch
- `compare.html` — "Player Comparison" as visually hidden h1
- `league-intel.html` — "Bureau of Intelligence" as h1
- `404.html` — can remain without (canonical points to home)

## Why It Matters

Every screenshot shared on Reddit/Twitter drives traffic. If Google can't properly index the Screener, organic search traffic is lost. An h1 with "fantasy football screener" helps SEO. This is a 2-minute fix with outsized impact.

## Design Rule

HTML semantics: every page should have exactly one `<h1>`.
