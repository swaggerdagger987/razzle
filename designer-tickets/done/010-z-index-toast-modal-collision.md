<!-- PM: ready -->
---
id: DQ-398
priority: P2
area: styles.css
section: layering
type: visual / z-index
status: open
---

# Toast and auth modal overlay share z-index 9999 — toast renders over modal

## What's wrong

styles.css line 647: `.auth-modal-overlay` uses `z-index: 9999`
styles.css line 1609: `.razzle-toast` uses `z-index: 9999`

Both share the same z-index. If a toast fires while the auth modal is open (e.g., a network error toast during login), the toast renders at the same layer as the modal overlay. Depending on DOM order, the toast may appear behind the modal backdrop or above the modal content, both wrong.

The skip-to-content link at line 390 uses `z-index: 10000`, which is correct (highest for a11y).

## Where

- `frontend/styles.css` line 647: `.auth-modal-overlay` z-index
- `frontend/styles.css` line 1609: `.razzle-toast` z-index

## Suggested fix

Set `.razzle-toast` to `z-index: 10001` (above modal AND skip-to-content, since toasts are ephemeral and need to be visible over everything).

Or better: define z-index tokens:
```
--z-modal: 9000;
--z-toast: 9500;
--z-skip: 10000;
```

## Not a dupe of

- DQ-029 (command palette z-index) — that's about the command palette, not toast/modal
