# DES-259: No navigator.share() for mobile share flows

**Priority:** P2
**Category:** Sharing / Mobile UX
**Affects:** lab.js, compare.js, all share/copy URL flows
**Cycle:** 25

## Problem

All share flows use `navigator.clipboard.writeText()` only. Zero calls to `navigator.share()` anywhere in the codebase. Mobile users (62%+ of Twitter/Reddit traffic) must:

1. Tap "Copy URL"
2. Switch to Twitter/Reddit/Messages
3. Paste

With `navigator.share()`, mobile users get the native OS share sheet — one tap to any app. iOS Safari, Android Chrome, and all modern mobile browsers support it.

## Why This Matters

The growth flywheel depends on sharing. "Every screenshot is a billboard. Every shareable URL is a funnel entry." (NORTH_STAR.md). Making sharing 2 taps instead of 4 on mobile increases share rate. The target audience (22-40, on their phones during commutes and lunch breaks) lives on mobile.

## Fix

In the share/copy URL functions across the codebase, check for `navigator.share` first, fall back to clipboard:

```javascript
function shareURL(url, title) {
  if (navigator.share) {
    navigator.share({ title: title || 'Razzle', url: url }).catch(function() {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function() {
      _showToast('copied to clipboard');
    });
  }
}
```

Key locations:
- lab.js: URL copy (line 167), context menu copy (line 2489), share URL (line 4195/4214), export share (line 6036)
- compare.js: URL copy (line 869)

## Scope

~10 call sites across 2-3 files. Add a shared `_shareOrCopy()` helper in app.js, replace individual clipboard calls.
