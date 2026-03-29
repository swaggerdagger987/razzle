---
id: S3-115
severity: S3
confidence: MEDIUM
category: ux-flow
source: EDGE-CASES.md #45
status: OPEN
---

# Shared screener URLs render different data based on recipient's tier — no indicator

## Root Cause

`frontend/lab.js:4248-4260` — `openShareModal()` serializes the current screener state (filters, sort, columns, panel) into a URL and presents it for sharing. The URL does NOT include any tier context.

```javascript
function openShareModal() {
  saveStateToURL();
  var shareURL = window.location.href;  // line 4251
  // ...
  document.getElementById("shareURLInput").value = shareURL;
}
```

**Problem**: A Pro user shares a URL that includes Pro-only columns (e.g., multi-season data, advanced analytics). When a Free user opens the URL:
- Pro-gated columns may render empty or with lock icons
- The overall table layout shifts because some columns are hidden
- The user sees different data than what was screenshotted/shared
- No banner or indicator explains "this view was created by a Pro user"

**Impact**: Confusing UX when URLs are shared on Reddit/Discord. The sharer's screenshot shows one thing, the recipient's view shows another. Low severity because the URL still works — it just looks different.

## Fix

Add a `tier=pro` or `tier=elite` query param when the sharer is a paid user. On the receiving end, show a subtle banner: "This view was created with Pro features. Some columns may be hidden. [Upgrade]"

In `openShareModal()` (line 4248):
```javascript
function openShareModal() {
  saveStateToURL();
  var shareURL = window.location.href;
  // Add tier context for shared URLs
  var user = JSON.parse(localStorage.getItem('razzle_user') || '{}');
  if (user.plan && user.plan !== 'free') {
    var url = new URL(shareURL);
    url.searchParams.set('shared_tier', user.plan);
    shareURL = url.toString();
  }
  // ...
}
```

In `loadStateFromURL()`, detect `shared_tier` param and show info banner if recipient's tier is lower.

## Files to Change

- `frontend/lab.js:4248-4260` — add `shared_tier` param in `openShareModal()`
- `frontend/lab.js` (loadStateFromURL) — detect `shared_tier` and show banner

## Accept When

1. Pro user shares URL → URL contains `shared_tier=pro`
2. Free user opens URL → sees subtle banner "This view includes Pro features"
3. Pro user opens same URL → no banner (same tier or higher)
4. Free user shares URL → no `shared_tier` param added

## Do NOT Touch

- `saveStateToURL()` / `loadStateFromURL()` core logic — only add the tier param
- Screenshot/PNG export — separate flow
- Reddit title generator — unrelated
