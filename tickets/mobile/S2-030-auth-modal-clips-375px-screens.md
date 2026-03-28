---
id: S2-030
severity: S2
category: mobile
title: Auth modal width 340px clips on 375px screens (iPhone SE)
source: deep-audit
status: open
---

## Problem

The auth modal has `width: 340px` at the 768px breakpoint. On a 375px screen (iPhone SE), this leaves only 17.5px margin each side. Tight but technically fits at 390px, but clips on iPhone SE (375px) with system padding.

## Root Cause

**`frontend/styles.css:1359-1365`** — at mobile breakpoint:
```css
.auth-modal {
  padding: 16px;
  width: 100%;
  max-width: 100vw;
  border-radius: 12px;
}
```
Modal uses `width: 100%; max-width: 100vw` which stretches to full viewport with no exterior margin/safe area. The 16px padding is interior only.

## Fix

Add exterior margin guard: `max-width: calc(100vw - 32px)` to ensure 16px safe margin on each side regardless of screen width.

## Accept When

- Auth modal fits comfortably on 375px screens with visible margin on both sides
- 390px+ screens are not affected
