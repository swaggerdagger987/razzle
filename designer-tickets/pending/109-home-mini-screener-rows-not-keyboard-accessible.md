# DES-109: Home page mini-screener table rows not keyboard accessible

**Priority**: P1 — conversion funnel entry point
**Category**: Keyboard accessibility
**WCAG**: 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value)

## Problem

The home page mini-screener table renders clickable rows via `<tr onclick="window.location='/lab.html'">`. These rows have:
- No `tabindex`
- No `role="link"`
- No `onkeydown` handler for Enter/Space
- No `cursor:pointer` indication

Keyboard users cannot navigate to the Lab from these rows. Screen readers don't announce them as interactive.

## Location

`frontend/index.html` line 971:
```js
html += '<tr onclick="window.location=\'/lab.html\'">';
```

## Evidence

The entire `<tr>` relies on mouse click only. There's no way for keyboard-only users to activate it.

## Fix

Add `tabindex="0"`, `role="link"`, `style="cursor:pointer"`, and an `onkeydown` handler:
```js
html += '<tr onclick="window.location=\'/lab.html\'" tabindex="0" role="link" style="cursor:pointer" onkeydown="if(event.key===\'Enter\')window.location=\'/lab.html\'">';
```

## Why This Matters

The home page is the conversion funnel entry point. The mini-screener widget is meant to entice visitors into the Lab. If keyboard users can't interact with it, they miss the primary CTA path from the home page.
