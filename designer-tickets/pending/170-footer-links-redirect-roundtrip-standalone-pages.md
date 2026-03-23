# DES-170: Home page footer links cause redirect roundtrip via standalone pages

**Priority**: P2
**Category**: UX / Performance
**Affects**: index.html footer — 31+ links to standalone panel pages
**Cycle**: 16

## Problem

The home page footer has 31+ links to standalone HTML pages (e.g., `/rankings.html`, `/breakouts.html`, `/tradevalues.html`). Each of these pages has a redirect script on line 8 that sends top-level visitors to `/lab.html?panel=X`.

Clicking a footer link triggers an unnecessary roundtrip:
1. Browser navigates to `/rankings.html`
2. Page loads, redirect script fires: `window.location.replace('/lab.html?panel=rankings')`
3. Browser navigates to `/lab.html?panel=rankings`

The user sees a flash of the standalone page before landing in the Lab.

## Evidence

`index.html` footer links to standalone pages:
```html
<a href="/rankings.html" class="footer-link">Rankings</a>
<a href="/tradevalues.html" class="footer-link">Trade Values</a>
<a href="/breakouts.html" class="footer-link">Breakouts</a>
<!-- ... 28 more links ... -->
```

Each standalone page has the redirect:
```html
<script>if(window.self===window.top)window.location.replace('/lab.html?panel=rankings');</script>
```

31 footer links × 1 extra page load each = 31 unnecessary roundtrips.

## Fix

Update all footer links to point directly to Lab panel URLs:
```html
<a href="/lab.html?panel=rankings" class="footer-link">Rankings</a>
<a href="/lab.html?panel=tradevalues" class="footer-link">Trade Values</a>
<a href="/lab.html?panel=breakouts" class="footer-link">Breakouts</a>
```

## Why it matters

Footer navigation is how users discover the 70+ panels. Every unnecessary redirect is a slower experience and a chance for the user to bounce. Direct links are faster, simpler, and don't flash intermediate content.
