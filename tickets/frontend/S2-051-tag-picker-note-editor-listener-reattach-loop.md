# S2-051: Tag picker + note editor {once:true} listener re-attach loop

**Severity**: S2 (Medium)
**Category**: frontend
**Source**: designer-tickets/DQ-421
**Found**: 2026-03-28
**Status**: OPEN

## Root Cause

`frontend/lab.js:508-510,627-629` — Both the tag picker and note editor attach a document click listener with `{once: true}` to detect outside clicks. When the click is INSIDE the picker/editor, the handler re-attaches itself (lines 519, 637). Each re-render of the table also calls the open function, adding another listener.

```javascript
// lab.js:508-510 (tag picker)
setTimeout(function() {
  document.addEventListener("click", _closeTagPickerOutside, { once: true });
}, 0);

// lab.js:519 (re-attach inside _closeTagPickerOutside)
document.addEventListener("click", _closeTagPickerOutside, { once: true });

// lab.js:627-629 (note editor, same pattern)
setTimeout(function() {
  document.addEventListener("click", _closeNoteEditorOutside, { once: true });
}, 50);
```

This causes unbounded listener accumulation if the user opens/closes the picker repeatedly without clicking outside.

## Fix

Replace `{once: true}` pattern with a persistent listener that checks visibility state:
```javascript
// Add once, check state inside:
document.addEventListener("click", function(e) {
  if (!_tagPickerVisible) return;
  if (tagPickerEl.contains(e.target)) return;
  closeTagPicker();
});
```

Or use `removeEventListener` with a named function reference before re-adding.

## Files to Change

- `frontend/lab.js:508-520` — tag picker listener
- `frontend/lab.js:627-638` — note editor listener

## Accept When

1. Opening/closing tag picker 100 times doesn't accumulate listeners
2. Click-outside-to-dismiss still works for both pickers
3. No memory growth from repeated open/close cycles
