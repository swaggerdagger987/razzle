---
id: DQ-171
priority: P1
category: ux/interaction
status: open
cycle: 26
---

# Native confirm() dialogs break Razzle immersion

## What's wrong

Three places use the browser's native `confirm()` dialog instead of a custom themed modal. Native dialogs look different on every browser/OS, break the warm comic-strip aesthetic, and can't be styled. Users see a cold Chrome/Firefox/Safari dialog in the middle of the Razzle experience.

## Where

| File | Line | Trigger |
|------|------|---------|
| `frontend/formulas.js` | 99 | Delete a custom formula |
| `frontend/lab.js` | 4415 | Delete a saved view |
| `frontend/lab.html` | 3406 | Right-click Tags button to clear all tags |

## Code

```javascript
// formulas.js:99
if (!confirm("Delete formula \"" + name + "\"?")) return;

// lab.js:4415
if (!confirm("Delete this saved view?")) return;

// lab.html:3406 (inline oncontextmenu)
if(getTaggedCount()>0 && confirm('Clear all player tags?')) clearAllTags();
```

## Fix

Create a reusable `razzleConfirm(message, onConfirm)` function in app.js that renders a themed modal with:
- 3px ink border, 4px 4px 0 box-shadow
- Caveat font question text
- Two btn-chunky buttons: "Cancel" and destructive action in --red
- Trap focus, Escape to dismiss
- Replace all 3 confirm() calls with this function

## Test

1. Open Lab, create a formula, click delete. Should see themed modal, not browser dialog.
2. Save a view, click delete. Same.
3. Tag some players, right-click Tags button. Same.
