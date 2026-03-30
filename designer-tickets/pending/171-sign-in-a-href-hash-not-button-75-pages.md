# DES-171: Sign In uses `<a href="#">` on 75 pages instead of `<button>`

**Priority**: P2
**Category**: Semantics / Accessibility
**Affects**: 75 HTML pages — every page except index.html
**Cycle**: 16

## Problem

The "Sign In" element in the navigation bar uses `<a href="#" onclick="...">` on 75 pages. Only `index.html` correctly uses `<button type="button">`.

The `<a href="#">` pattern:
- Announces as "link" to screen readers (it's an action, not a navigation)
- Scrolls to top of page if JavaScript fails (the `return false` only works when JS executes)
- Shows `#` in the URL bar briefly
- Doesn't match the semantic intent (Sign In opens a modal, not a page)

## Evidence

`index.html:636` (correct):
```html
<button type="button" class="btn-chunky btn-sm" onclick="if(typeof openAuthModal==='function') openAuthModal();">Sign In</button>
```

All other pages (e.g., `breakouts.html:365`, `pricing.html:203`):
```html
<a href="#" class="btn-chunky btn-sm" onclick="if(typeof openAuthModal==='function') openAuthModal(); return false;">Sign In</a>
```

75 pages use the incorrect `<a>` pattern.

## Fix

Replace `<a href="#">` with `<button type="button">` on all 75 pages:
```html
<button type="button" class="btn-chunky btn-sm" onclick="if(typeof openAuthModal==='function') openAuthModal();">Sign In</button>
```

## Why it matters

Sign In is in the nav bar on every page. Screen readers announce it incorrectly on 75 of 76 pages. If app.js fails to load (ad blockers, slow network), clicking "Sign In" jumps the page to top instead of doing nothing gracefully.
