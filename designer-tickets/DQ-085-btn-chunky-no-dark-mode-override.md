# DQ-085: btn-chunky has no dark mode override — Sign In button near-invisible

**Priority**: P1 — conversion / dark mode
**Category**: Dark Mode / Component
**Files**: `frontend/styles.css:1647-1649`, all pages with nav Sign In

## Problem

`.btn-chunky` has NO `[data-theme="dark"]` override in styles.css. The base styling is:

```css
.btn-chunky {
  background: transparent;
  color: var(--ink);
  border: 2px solid var(--ink);
}
```

In dark mode, `--ink` flips to `#ede0cf` (sand). So the button becomes: transparent background + sand border + sand text on a dark brown background. This is technically visible but extremely low-contrast compared to other interactive elements.

Meanwhile, `.btn-primary` got a dark mode override in DES-017 (done). `.btn-chunky` was missed.

The Sign In button in the nav uses `btn-chunky btn-sm` on every page. In dark mode, it blends into the nav bar and looks like a ghost button rather than a primary action.

## Fix

Add dark mode override for btn-chunky:

```css
[data-theme="dark"] .btn-chunky {
  border-color: var(--ink);
  color: var(--ink);
  background: var(--bg-warm);  /* subtle warm fill for visibility */
}

[data-theme="dark"] .btn-chunky:hover {
  background: var(--ink);
  color: var(--bg);
}
```

## Why It Matters

Sign In is the conversion gateway. In dark mode, a near-invisible Sign In button loses returning users. Every page has this button. DES-017 fixed btn-primary dark mode — btn-chunky was the other half of the same problem.

## Verification

Toggle dark mode on any page. The Sign In button (and all btn-chunky instances) should be clearly visible with a warm background fill, not just a faint outline.
