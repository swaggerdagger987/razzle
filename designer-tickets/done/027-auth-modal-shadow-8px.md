# DES-027: Auth modal box-shadow 8px instead of design-spec 4px

**Priority**: P1
**Area**: sitewide (styles.css)
**Impact**: The auth modal — the single gateway to every conversion (register, login, upgrade) — has `box-shadow: 8px 8px 0` instead of the design guide's `4px 4px 0`. It's the ONLY component in the entire codebase with an 8px shadow. Makes the login modal feel oversized and visually heavy compared to every other card on the site.

## The Problem

`frontend/styles.css` line 609:
```css
.auth-modal {
  background: var(--bg-card);
  border: 3px solid var(--ink);
  border-radius: 16px;         /* also wrong — see DES-028 */
  box-shadow: 8px 8px 0 var(--ink);  /* ← should be 4px 4px 0 */
  padding: 32px;
  width: 380px;
  max-width: 92vw;
  position: relative;
}
```

Every other card/container in the site uses `4px 4px 0` or `2px 2px 0`. The auth modal is the lone exception at `8px 8px 0`.

## The Fix

```css
.auth-modal {
  box-shadow: 4px 4px 0 var(--ink);
}
```

## Why This Matters

Every conversion starts with the auth modal. It should feel like part of the same design system as the rest of the site. An oversized shadow makes it feel out of place — like a component from a different product.
