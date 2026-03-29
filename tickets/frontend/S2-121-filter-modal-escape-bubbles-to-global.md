---
id: S2-121
severity: S2
confidence: HIGH
category: frontend
source: DQ-412
status: OPEN
---

# Filter modal Escape key bubbles to global handler — double dismiss

## Root Cause

When pressing Escape inside the filter modal input, the event is not stopped, so it also fires the global Escape handler which dismisses row highlights, clears selections, or triggers other global actions.

**File**: `frontend/lab.html:3551`

```html
<input ... onkeydown="if(event.key==='Enter'){event.preventDefault();addFilter();}">
```

Only Enter is handled. Escape propagates to the global handler at `frontend/lab.js:10638`.

## Fix

Add Escape handling to the filter modal input that closes the modal AND stops propagation:

```javascript
if(event.key==='Escape'){event.stopPropagation();closeFilterModal();}
```

Or handle it in the modal overlay's keydown listener with `event.stopPropagation()`.

## Acceptance Criteria

- [ ] Pressing Escape in filter modal closes the modal only
- [ ] Escape does NOT also trigger global handlers (row unhighlight, selection clear)
- [ ] Enter still adds the filter as before
