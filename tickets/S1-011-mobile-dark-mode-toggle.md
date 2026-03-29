---
id: S1-011
severity: S1
category: mobile
title: "Dark mode toggle accessibility on mobile"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
---

# S1-011: No visible dark mode toggle on mobile

## Finding

The deep audit questions whether the dark mode toggle is accessible on mobile, since the hamburger menu hides nav links.

## Root Cause Investigation

**Status: Already handled in current code.**

**Desktop toggle** — `frontend/app.js:72-92` (`_injectThemeToggle()`):
Injects a theme toggle button into `.topnav` at line 88.

**Mobile toggle** — `frontend/app.js:194-208`:
A separate theme toggle is created and appended to `#mobile-nav-actions` inside the hamburger panel (line 208). This means the dark mode toggle IS accessible within the mobile hamburger menu.

```javascript
// lines 194-195: Inject theme toggle into mobile panel footer
var actions = panel.querySelector("#mobile-nav-actions");
// lines 196-208: Create button and append to actions
```

## Conclusion

The dark mode toggle is present in the mobile hamburger panel footer. It's accessible when the mobile nav is open.

**Verify**: Open razzle.lol on mobile, tap hamburger, confirm dark mode toggle is visible and functional.

## Acceptance Criteria

- [x] Dark mode toggle present in mobile hamburger panel
- [ ] Verify on live deploy at 390px viewport
