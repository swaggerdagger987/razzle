---
id: DQ-421
title: Tag picker + note editor {once:true} listener re-attach loop — unbounded accumulation
priority: P1
category: performance / UX
page: lab.html
cycle: 54
---

## Problem

Both `_closeTagPickerOutside` (lab.js:501-508) and `_closeNoteEditorOutside` (lab.js:620-626) use a pattern where they re-attach themselves as `{ once: true }` click listeners if the click was INSIDE the picker/editor:

```javascript
function _closeTagPickerOutside(e) {
  const picker = document.getElementById("tagPicker");
  if (picker && !picker.contains(e.target)) {
    hideTagPicker();
  } else if (picker) {
    // Re-attach if clicked inside ← attaches new listener every click
    document.addEventListener("click", _closeTagPickerOutside, { once: true });
  }
}
```

Every click inside the picker/editor adds a new `{ once: true }` listener. These listeners accumulate but never fire (because the next click consumes one, then re-adds another). Over a session where a user tags 50 players, 50+ stale listeners queue up.

## Why it matters

Memory growth during normal Lab use. Dynasty power users who tag many players in a session will see gradual performance degradation. The tag/note features are core Lab interactions — they shouldn't leak.

## Fix

Replace the re-attach pattern with a persistent listener that checks picker visibility:

```javascript
document.addEventListener("click", function(e) {
  if (!_tagPickerVisible) return;
  const picker = document.getElementById("tagPicker");
  if (picker && !picker.contains(e.target)) hideTagPicker();
});
```

One listener, always active, no accumulation.

## Files
- `frontend/lab.js` — lines 496-508 (tag picker), lines 614-626 (note editor)
