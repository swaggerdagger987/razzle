# DES-161: 5+ buttons in lab.html missing `type="button"`

**Priority**: P2 (Interaction correctness)
**Page**: lab.html (The Lab / Screener)
**Category**: HTML correctness

## The Problem

Multiple `<button>` elements in lab.html lack an explicit `type` attribute. Per HTML spec, buttons without `type` default to `type="submit"`, which can trigger unintended form submissions if a button is inside or associated with a form element.

## Evidence

Buttons missing `type="button"` in lab.html:
- `<button class="lab-menu-toggle btn-chunky">` — sidebar toggle
- `<button class="nav-search-hint" onclick="openCmdPalette();">` — Ctrl+K search
- `<button class="lab-sidebar-toggle" onclick="toggleSidebar()">` — sidebar toggle (mobile)
- `<button class="btn-chunky universe-toggle">` — NFL/College toggle
- `<button class="btn-chunky college-view-btn">` — College view button

All 5 are action buttons, not form submit buttons. They use `onclick` handlers for their behavior.

## The Fix

Add `type="button"` to each button element:
```html
<button type="button" class="lab-menu-toggle btn-chunky">
<button type="button" class="nav-search-hint" onclick="openCmdPalette();">
<!-- etc. -->
```

Also audit other HTML pages for the same issue — pricing.html, league-intel.html, agents.html may have similar buttons.

## Why This Matters

While most of these buttons are outside forms today, future DOM changes or wrapping elements could introduce a parent `<form>`, causing these buttons to submit forms on click. Adding `type="button"` is defensive and zero-risk. It's a one-line fix per button that prevents a class of bugs.
