# DES-095: Skip-to-content links use inline onfocus/onblur JS instead of CSS class

**Priority**: P2
**Area**: sitewide (all 75 HTML pages)
**Cycle**: 9

## Problem

Every page has a skip-to-content link for keyboard accessibility, but each one uses identical inline JavaScript for focus/blur styling:

```html
<a href="#main-content" class="sr-only"
  style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;"
  onfocus="this.style.position='static';this.style.width='auto';this.style.height='auto';"
  onblur="this.style.position='absolute';this.style.left='-9999px';this.style.width='1px';this.style.height='1px';">
  Skip to main content
</a>
```

### Issues

1. **75 copies of identical inline JS** — unmaintainable. Any fix requires touching all 75 files.
2. **Inline styles override CSS** — the `style` attribute prevents CSS class-based styling.
3. **No visual styling when focused** — the link becomes visible but has no Razzle-branded focus style (no orange outline, no chunky border).
4. **Inline event handlers** are a CSP concern if Content-Security-Policy is ever tightened.

## Fix

1. Add a `.skip-link` class to `styles.css`:

```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: 10000;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--bg-card);
  background: var(--ink);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  text-decoration: none;
}
.skip-link:focus {
  position: fixed;
  top: 8px;
  left: 8px;
  width: auto;
  height: auto;
  outline: 3px solid var(--orange);
  outline-offset: 2px;
}
```

2. Replace inline version in all 75 pages:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

## Design Rule

WCAG 2.1 SC 2.4.1: Bypass Blocks. Skip links are correct in intent but should use CSS for maintainability and consistent branding. The inline JS pattern creates 75 potential failure points.
