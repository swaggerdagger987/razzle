# DES-202: formulas.js row remove is <span onclick> not <button>

**Priority**: P2
**Category**: Accessibility
**Affects**: formulas.js — Formula Builder (core Lab feature)
**Cycle**: 19

## Problem

The formula builder's "remove row" control is a `<span>` with an inline `onclick` handler. It has no semantic role, no ARIA label, no keyboard accessibility, and no focus styling. Keyboard users cannot reach or activate it. Screen readers don't announce it as interactive.

## Evidence

`formulas.js:33`:
```javascript
<span style="cursor:pointer; color:var(--red); font-weight:700; font-size:16px;" onclick="this.parentElement.remove()">×</span>
```

Issues:
1. `<span>` — not announced as interactive by screen readers
2. No `role="button"` — no semantic meaning
3. No `aria-label` — screen reader would just say "times" (the × character)
4. No `tabindex="0"` — unreachable by keyboard
5. Inline `onclick` — CSP concern, event should be delegated
6. `this.parentElement.remove()` — no cleanup, no state update notification
7. `font-weight:700` used correctly here but `font-weight:bold` used elsewhere (DES-198)

## Fix

Replace with a proper `<button>`:
```javascript
<button type="button" class="btn-icon" aria-label="Remove formula row" style="color:var(--red); font-size:16px; background:none; border:none; cursor:pointer; padding:4px; min-width:24px; min-height:24px;">×</button>
```

And attach the event listener via delegation on the formula container instead of inline onclick.

## Why it matters

The formula builder is a flagship Lab feature — custom formulas are what make the Screener "best-in-class." A keyboard user building a multi-row formula can't remove rows without a mouse. This is a core workflow broken for accessibility.
