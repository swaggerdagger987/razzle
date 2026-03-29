# S1-008: Context menu copy has no clipboard fallback for HTTP/iframe

**Severity**: S1 (High)
**Category**: ui-bug
**Source**: EDGE-CASES.md #25
**Found**: 2026-03-14 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/lab.js:2527` — Context menu "Copy player name" uses `navigator.clipboard.writeText()` without a fallback. On HTTP (non-HTTPS) or in iframes, the Clipboard API silently fails.

```javascript
// lab.js:2527
try { navigator.clipboard.writeText(d.pName).then(...).catch(...); }
// No fallback to document.execCommand("copy")
```

Other copy functions in the same file DO have proper fallbacks:
- Share link (lab.js:175-183) — falls back to `_fallbackCopy(url)`
- TSV copy (lab.js:6124-6129) — falls back to `_fallbackCopy(tsv)`
- Reddit table (lab.js:6163-6167) — falls back to `_fallbackCopy(md)`

The `_fallbackCopy()` helper already exists in lab.js but is not used here.

## Fix

Use the existing `_fallbackCopy()` helper in the catch block:

```javascript
try {
  navigator.clipboard.writeText(d.pName)
    .then(() => showToast("copied to clipboard"))
    .catch(() => {
      _fallbackCopy(d.pName);
      showToast("copied to clipboard");
    });
} catch(e) {
  _fallbackCopy(d.pName);
  showToast("copied to clipboard");
}
```

## Files to Change

- `frontend/lab.js:2527` — add `_fallbackCopy()` in catch

## Accept When

1. Right-click player → "Copy name" works on HTTP localhost
2. Works in iframes (embedded views)
3. Toast still shows "copied to clipboard" on success

## Do NOT Touch

- Other copy functions — they already have proper fallbacks
- `_fallbackCopy()` helper — it's correct as-is
