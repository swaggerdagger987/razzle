---
id: DQ-460
priority: P3
category: semantic-html
status: open
cycle: 58
---

# DQ-460: 75 pages use `<a href="#" onclick>` for sign-in button instead of `<button>`

## Problem

Every page has a sign-in link in the nav bar using this pattern:
```html
<a href="#" class="btn-chunky btn-sm" onclick="if(typeof openAuthModal==='function') openAuthModal(); return false;">Sign In</a>
```

This is semantically wrong. The element:
- Has no real `href` destination (just `#`)
- Triggers a JavaScript modal (action, not navigation)
- Uses `return false` to prevent default anchor behavior

It should be a `<button>` element. Anchor tags are for navigation; buttons are for actions.

## Evidence

```bash
grep -rn 'href="#".*openAuthModal' frontend/*.html | wc -l
# Result: 75+ matches
```

All standalone pages, lab.html, index.html, agents.html, league-intel.html, pricing.html — every page with the nav bar.

## Fix

Replace across all 75 pages:
```html
<!-- Before -->
<a href="#" class="btn-chunky btn-sm" onclick="if(typeof openAuthModal==='function') openAuthModal(); return false;">Sign In</a>

<!-- After -->
<button type="button" class="btn-chunky btn-sm" onclick="if(typeof openAuthModal==='function') openAuthModal();">Sign In</button>
```

The `return false` is no longer needed since buttons don't have default navigation behavior.

## Why It Matters

- Screen readers announce these as "link" instead of "button" — confusing for assistive technology users
- Browser back button gets polluted with `#` entries if `return false` fails
- Semantic HTML is a WCAG requirement (ARIA: if it acts like a button, it must BE a button)

## Verification

```bash
grep -rn 'href="#".*openAuthModal' frontend/*.html | wc -l
# Should be 0
```
