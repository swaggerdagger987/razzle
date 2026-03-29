---
id: S3-104
severity: S3
confidence: HIGH
category: design
source: DQ-236
status: OPEN
---

# Nav user dropdown header email displayed at 10px — below type scale minimum

## Root Cause

The nav dropdown header shows the user's email at `font-size: 10px`. DESIGN.md type scale minimum is 11px.

**File**: `frontend/styles.css:594-599`

```css
.nav-dropdown-header {
  font-size: 10px;
  /* ... */
}
```

Email content generated at `frontend/app.js:1319`.

## Fix

Bump to 11px (type scale minimum):

```css
.nav-dropdown-header {
  font-size: 11px;
}
```

## Acceptance Criteria

- [ ] `.nav-dropdown-header` uses `font-size: 11px` or `var(--font-size-xs)` if defined
- [ ] Email text remains readable and fits within dropdown width
