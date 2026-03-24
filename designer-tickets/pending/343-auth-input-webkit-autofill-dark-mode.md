# DQ-343: Auth input :-webkit-autofill has no dark mode override

**Priority**: P2
**Category**: Dark Mode — Auth
**File**: frontend/styles.css (auth section, around line 721)

## Problem

When a browser autofills email/password fields in the auth modal, Chrome/Edge paint the input background with a light blue/yellow tint (`-webkit-autofill`). In dark mode, this creates a jarring light-colored input field against the dark espresso background.

No `[data-theme="dark"] .auth-form input:-webkit-autofill` rule exists. The auth modal has dark mode overrides for the form itself but not for the browser's autofill state.

This is different from DQ-183 (color-scheme meta tag for native controls) — this is specifically about the autofill background color override.

## Fix

Add to styles.css after the auth form dark mode rules:
```css
[data-theme="dark"] .auth-form input:-webkit-autofill,
[data-theme="dark"] .auth-form input:-webkit-autofill:hover,
[data-theme="dark"] .auth-form input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px var(--bg-warm) inset !important;
  -webkit-text-fill-color: var(--ink) !important;
  caret-color: var(--ink);
}
```

This is the standard pattern for dark mode autofill overrides.
