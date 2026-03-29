---
id: S2-011
severity: S2
category: mobile
title: "Command palette discoverable on mobile via search button"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
---

# S2-011: Command palette (Ctrl+K) not discoverable on mobile

## Finding

The deep audit says the `Ctrl+K Search` hint is hidden on mobile and there's no way to discover the command palette.

## Root Cause Investigation

**Status: Already fixed in current code.**

**File: `frontend/app.js:184`** — Mobile nav includes a dedicated search button:
```javascript
'<button class="btn-chunky btn-sm" style="width:100%;min-height:44px;..."
  onclick="if(typeof openCmdPalette===\'function\'){openCmdPalette();document.querySelector(\'.mobile-nav-overlay\').click();}"
  aria-label="Open search">'
```

This button opens the command palette from within the mobile hamburger menu, with proper touch target sizing (min-height: 44px).

## Conclusion

Mobile users can access the command palette through the hamburger menu search button. No action needed.
