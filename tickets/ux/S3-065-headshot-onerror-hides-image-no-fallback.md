---
id: S3-065
severity: S3
confidence: HIGH
category: ui-bug
source: DQ-169
status: OPEN
---

# Headshot onerror hides image but leaves layout gap — no fallback

## Root Cause

19+ standalone pages set `img.onerror = function() { this.style.display = 'none'; }` on player headshot images. When the headshot URL fails (404 or null), the image disappears but its layout space remains, creating a gap. No placeholder initials or generic avatar shown.

## Fix

Replace `display:none` with a fallback avatar:
```js
img.onerror = function() {
  this.src = 'data:image/svg+xml,...'; // generic player silhouette
  this.onerror = null; // prevent infinite loop
};
```

Or show player initials in a colored circle.

## Files

- 19+ standalone HTML files with headshot images

## Acceptance Criteria

- Failed headshot loads show a fallback avatar/initials
- No empty layout gaps where headshots should be
