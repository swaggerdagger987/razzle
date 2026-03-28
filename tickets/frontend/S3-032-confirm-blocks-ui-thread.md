---
id: S3-032
severity: S3
category: ui-bug
finding_ref: EDGE-67
confidence: LOW
---

# S3-032: confirm() for delete saved views blocks UI thread

## Root Cause

Three `confirm()` calls across the frontend break the comic-strip aesthetic:

1. `frontend/lab.js:4490` — Delete saved view
2. `frontend/formulas.js:105` — Delete formula
3. `frontend/lab.html:3412` — Clear all player tags (inline onclick)

Native `confirm()` blocks the entire UI thread. On mobile, it can be jarring and
doesn't match Razzle's brand voice. (See also: designer-tickets/DQ-171)

## What to Fix

Replace all 3 with an inline confirmation (e.g., button text changes to "sure? click again"):

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

- `frontend/lab.js:4490` — delete saved view confirm()
- `frontend/formulas.js:105` — delete formula confirm()
- `frontend/lab.html:3412` — clear all tags confirm() in inline onclick

## Acceptance Criteria

- [ ] Delete requires two clicks (first click = "sure?", second = delete)
- [ ] Confirmation resets after 3 seconds if not confirmed
- [ ] No native browser dialogs used

## Do NOT

- Do not build a full modal for this — inline confirmation is sufficient
