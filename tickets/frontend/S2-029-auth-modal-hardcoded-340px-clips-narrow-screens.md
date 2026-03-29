# S2-029: Auth modal hardcoded 340px clips on screens below 375px

**Severity**: S2 (Minor)
**Category**: mobile
**Source**: Deep Audit 2026-03-28, finding S2-009

## Problem

The auth modal has a hardcoded `width: 340px` at the 768px mobile breakpoint.
On a 390px screen with body padding, this leaves only 25px margin per side.
On narrower screens (iPhone SE at 375px, or with system font scaling), the modal
may clip or require horizontal scrolling.

## Root Cause

- `frontend/styles.css:1018` — Inside `@media (max-width: 768px)` block:
  ```css
  .auth-modal { padding: 24px; width: 340px; }
  ```

## Fix

Change to responsive width:
```css
.auth-modal { padding: 24px; width: min(340px, calc(100vw - 32px)); }
```

## Scope

- 1 file: `frontend/styles.css`
- 1 line change
