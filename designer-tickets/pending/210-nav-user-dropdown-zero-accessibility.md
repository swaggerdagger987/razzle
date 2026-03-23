---
id: DES-210
title: Nav user dropdown missing aria-expanded, Escape close, role="menu"
priority: P2
category: accessibility
page: sitewide (app.js)
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

The logged-in user account dropdown (email, subscription status, Sign Out) has zero accessibility attributes. The hamburger mobile menu on the SAME page IS fully accessible — the dropdown isn't.

Missing:
1. `aria-expanded` on trigger button (hamburger has it, line 130)
2. `aria-haspopup="menu"` on trigger button
3. `role="menu"` on dropdown menu
4. `role="menuitem"` on dropdown items
5. Escape key to close (hamburger has it, line 247)
6. Focus management on open/close

## Evidence

app.js line ~1123-1134 generates the dropdown:
```js
'<button class="nav-user-trigger" onclick="this.parentElement.classList.toggle(\'open\')">' +
  badge + '<span class="nav-user-name">' + displayName + '</span>' +
'</button>' +
'<div class="nav-dropdown-menu">' + ... + '</div>'
```

No `aria-expanded`, no `aria-haspopup`, no keyboard handlers. Close only via click-outside (line 296-297).

Compare hamburger menu (line 122-131): proper `aria-label`, `aria-expanded`, Escape handler, focus return to trigger.

## Why it matters

This dropdown is how paid users access subscription management and sign out. Keyboard and screen reader users on the conversion path can't operate it. The pattern for correct implementation already exists in the same file.

## Fix

1. Add `aria-expanded="false"` and `aria-haspopup="menu"` to trigger button
2. Toggle `aria-expanded` on open/close
3. Add `role="menu"` to `.nav-dropdown-menu`, `role="menuitem"` to items
4. Add Escape key handler to close dropdown
5. Return focus to trigger on close

## Scope

app.js updateAuthUI function (~line 1123). ~15 lines of changes.
