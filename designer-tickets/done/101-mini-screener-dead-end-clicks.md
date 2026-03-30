<!-- PM: ready -->
---
id: DES-351
priority: P1
area: index.html
section: mini-screener interaction
type: ux / dead-end
status: open
---

# Mini-screener rows click to /lab.html with no player context

## What's wrong

Every row in the home page mini-screener uses:
```
html += '<tr onclick="window.location=\'/lab.html\'">';
```

When a user clicks on "Bijan Robinson" in the mini-screener, they expect to see Bijan Robinson's data in the Lab. Instead, they get the default Lab view with no search, no filter, no player highlighted. The player they clicked on is lost.

This is a UX dead-end: the interaction promises specificity but delivers generality.

## Where

- `frontend/index.html` line 983: `onclick="window.location='/lab.html'"`
- All 15 rows in the mini-screener have the same generic link

## Suggested fix

Option A: Link to player-specific search: `window.location='/lab.html?search=' + encodeURIComponent(p.name)`
Option B: Link to player profile: `window.location='/player/' + p.player_id` (if player IDs are available in the API response)
Option C: At minimum, highlight the clicked player's position: `window.location='/lab.html?pos=' + p.position`

## Not a dupe of

- DES-109 (mini-screener rows not keyboard accessible) — that's about Tab/Enter, not about WHERE the click goes
- DES-189 (mini-screener th not keyboard accessible) — that's about column headers

## Why this matters

The mini-screener is the #1 conversion hook on the home page. Every row click is a potential Lab user. A generic redirect wastes that intent.
