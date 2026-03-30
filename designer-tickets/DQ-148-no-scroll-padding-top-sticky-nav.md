---
id: DQ-148
priority: P2
area: ux
section: navigation
type: scroll-bug
status: open
---

# No scroll-padding-top — anchor links scroll behind sticky nav

## What's wrong

The `.topnav` is `position: sticky` (styles.css:162) with approximately 60px total height (38px logo + 20px padding + 3px border). There is no `scroll-padding-top` on `html` or `body`. When any in-page anchor link or `scrollIntoView()` fires, the target element scrolls behind the sticky nav, cutting off the top of the content.

## Where

- `styles.css:162` — `.topnav { position: sticky; top: 0; }` (~60px tall)
- `styles.css` — NO `scroll-padding-top` on `html` or `body`
- `app.js` — skip-to-content link targets `#main-content`
- Various pages use `scrollIntoView()` for panel navigation

## Fix

Add to styles.css, on the `html` element:

```css
html {
  scroll-padding-top: 68px; /* nav height + breathing room */
}
```

This fixes ALL anchor scrolling sitewide — both `<a href="#section">` links and JS `element.scrollIntoView()` calls.

## Why this matters

The skip-to-content accessibility link scrolls #main-content behind the nav. Any future anchor navigation will have the same problem. This is a one-line fix that prevents a class of scroll bugs.
