---
id: DES-449
priority: P3
area: semantics
section: breakouts panel
type: css-misuse
status: open
---

# breakouts.html error handler uses .breakouts-empty class (wrong semantics)

## What's wrong

The breakouts page uses the same CSS class for both error and empty states:

- Line 548 (API error): `<div class="breakouts-empty">` + `razzleError()`
- Line 555 (no results): `<div class="breakouts-empty">` + "no breakout candidates found"

Error and empty are semantically different states. Error means "something went wrong, retry." Empty means "your filter matched nothing, adjust." They should look different.

## Where

`frontend/breakouts.html`:
- Line 325: `.breakouts-empty` CSS class definition
- Line 548: Error state uses `.breakouts-empty` (wrong)
- Line 555: Empty state uses `.breakouts-empty` (correct)

## Fix

1. Add `.breakouts-error` CSS class with distinct styling (red-tinted left border):
```css
.breakouts-error {
  text-align: center;
  padding: 40px 20px;
  color: var(--ink-medium);
  border-left: 4px solid var(--red);
}
```

2. Change line 548:
```javascript
bodyEl.innerHTML = '<div class="breakouts-error">' + razzleError() + '</div>';
```

## Why it matters

Reusing the "empty" class for errors trains users to ignore errors. When error and empty look the same, users can't tell whether the product is broken or their filter just returned nothing. Small CSS addition, big UX clarity.
