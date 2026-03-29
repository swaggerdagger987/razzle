---
id: S2-009
severity: S2
category: mobile
title: "Auth modal responsive width uses max-width: 92vw"
status: resolved-at-investigation
audit: DEEP-AUDIT-TICKETS.md
decomposed-to: RESOLVED (styles.css:667-668 max-width:92vw prevents clipping)
---

# S2-009: Mobile auth modal width may clip on narrow screens

## Finding

The deep audit says the auth modal has `width: 340px` which could clip at 375px.

## Root Cause Investigation

**Status: Already handled with responsive max-width.**

**File: `frontend/styles.css:667-668`**:
```css
width: 380px;
max-width: 92vw;
```

**File: `frontend/styles.css:1041`** — Mobile override:
```css
width: 340px;  /* at mobile breakpoint */
```

The `max-width: 92vw` ensures the modal never exceeds 92% of viewport width. On a 375px screen, this caps at ~345px, which is wider than the 340px override. The modal will always fit.

## Conclusion

The responsive `max-width: 92vw` already prevents clipping on narrow screens. No action needed.
