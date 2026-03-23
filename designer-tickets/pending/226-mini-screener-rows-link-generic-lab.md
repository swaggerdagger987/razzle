# DES-226: Home page mini-screener rows link to generic /lab.html — no player context

**Priority**: P2 (Conversion UX — drops context at the key moment)
**Page**: index.html
**Category**: UX / Conversion funnel

## The Problem

The live mini-screener on the home page shows the top 15 players with PPG, GP, and Age. Each row is clickable:

```javascript
// index.html line 983
html += '<tr onclick="window.location=\'/lab.html\'">';
```

Every row links to `/lab.html` — the generic screener with no search pre-filled. A user clicks "Patrick Mahomes" and lands on an empty screener. The context is lost.

The user's thought process:
1. "Oh cool, Mahomes is #3 in PPG"
2. *clicks Mahomes row*
3. *lands on empty screener*
4. "Wait, where's Mahomes? What am I looking at?"
5. *bounces*

## The Fix

Link each row to the Lab with the player's name pre-filled in the search:

```javascript
html += '<tr onclick="window.location=\'/lab.html?search=' + encodeURIComponent(p.name) + '\'" style="cursor:pointer;">';
```

Or link to the player profile page if available:
```javascript
html += '<tr onclick="window.location=\'/lab.html?search=' + encodeURIComponent(p.name) + '\'" style="cursor:pointer;">';
```

Also add `style="cursor:pointer;"` to indicate clickability (currently no cursor change on hover).

## Why This Matters

The mini-screener is the #1 on-page conversion tool. A visitor sees live data, clicks a player they're interested in, and should IMMEDIATELY see depth. Instead they land on a blank page. This is a context drop at the exact moment of highest curiosity. Preserving context (pre-filling the search with the clicked player's name) turns a bounce into an exploration.

The existing URL state serialization in lab.js supports `?search=` parameters — this is a one-line fix that connects two existing features.
