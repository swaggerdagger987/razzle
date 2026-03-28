---
id: S3-032
severity: S3
category: ui-bug
finding_ref: EDGE-67
confidence: LOW
---

# S3-032: confirm() for delete saved views blocks UI thread

## Root Cause

`frontend/lab.js:4490`:
```javascript
function deleteSavedView(id) {
  if (!confirm("Delete this saved view?")) return;
  const views = getSavedViews().filter(v => v.id !== id);
  ...
}
```

Native `confirm()` blocks the entire UI thread. On mobile, it can be jarring and
doesn't match Razzle's brand voice.

## What to Fix

Replace with an inline confirmation (e.g., button text changes to "sure? click again"):

```javascript
function deleteSavedView(id, btn) {
  if (!btn.dataset.confirming) {
    btn.dataset.confirming = "1";
    btn.textContent = "sure?";
    setTimeout(() => { delete btn.dataset.confirming; btn.textContent = "×"; }, 3000);
    return;
  }
  delete btn.dataset.confirming;
  // proceed with deletion
}
```

## Files to Change

- `frontend/lab.js` — Line 4490, replace confirm() with inline confirmation pattern

## Acceptance Criteria

- [ ] Delete requires two clicks (first click = "sure?", second = delete)
- [ ] Confirmation resets after 3 seconds if not confirmed
- [ ] No native browser dialogs used

## Do NOT

- Do not build a full modal for this — inline confirmation is sufficient
