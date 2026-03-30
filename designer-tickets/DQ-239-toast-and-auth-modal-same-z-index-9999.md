---
id: DQ-239
priority: P2
category: stacking / UX
pages: styles.css (affects all pages)
status: open
cycle: 33
---

# Toast notifications and auth modal share z-index: 9999 — unpredictable overlap

## What's wrong

Two unrelated UI layers share the exact same z-index value:

- `styles.css` line ~647: `.auth-modal-overlay { z-index: 9999; }`
- `styles.css` line ~1609: `.razzle-toast { z-index: 9999; }`

When both are visible simultaneously (e.g., user clicks "Sign In" and a toast appears for a different action), the stacking order depends on DOM order, not intentional hierarchy. This can cause:
- Toast appearing BEHIND the modal backdrop (invisible to user)
- Toast appearing ON TOP of the modal (covering the login form)

Note: DQ-079 covers the broader z-index chaos across inline HTML. This ticket is specifically about the CSS class collision between two interactive components that can coexist.

## Fix

Toast should always be above modals (toasts are transient feedback, modals are persistent UI):

```css
.auth-modal-overlay { z-index: 9000; }
.razzle-toast { z-index: 10000; }
```

Or better, use the z-index tokens proposed in DQ-079 once those are implemented.

## Verification

1. Open the auth modal (click Sign In)
2. Trigger a toast (e.g., export CSV)
3. Toast should appear on top of the modal overlay, fully visible.
