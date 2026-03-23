---
id: DQ-178
priority: P2
category: accessibility
status: open
cycle: 26
---

# auction.html search input missing ARIA attributes

## What's wrong

The player search input on auction.html is missing all ARIA attributes that every other search input in the codebase has. Compare:

| Attribute | auction.html | breakdown.html (correct) |
|-----------|-------------|-------------------------|
| `aria-label` | MISSING | "Player search" |
| `role` | MISSING | "combobox" |
| `aria-autocomplete` | MISSING | "list" |
| `aria-expanded` | MISSING | "false" |
| `aria-controls` | MISSING | references dropdown ID |
| `autocomplete` | MISSING | "off" |

Screen readers won't announce this as a search field or communicate autocomplete behavior.

## Where

- `frontend/auction.html:350`

## Code

```html
<!-- Current (broken) -->
<input type="text" id="search-input" placeholder="search players...">

<!-- Should be -->
<input type="text" id="search-input" placeholder="search players..." autocomplete="off"
  aria-label="Search players" role="combobox" aria-autocomplete="list" aria-expanded="false">
```

## Fix

Add the missing ARIA attributes to match the pattern used in breakdown.html, career.html, gamelog.html, and all other search inputs.

## Test

1. Use screen reader on /auction.html. Tab to search input. Should announce "Search players, combo box".
