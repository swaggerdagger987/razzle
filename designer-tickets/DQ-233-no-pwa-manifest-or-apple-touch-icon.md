---
id: DQ-233
priority: P2
category: infrastructure / mobile
pages: index.html (and all pages)
status: open
cycle: 33
---

# No PWA manifest or apple-touch-icon — mobile home screen broken

## What's wrong

No page in the entire site includes:
- `<link rel="manifest" href="/manifest.json">` — required for Android "Add to Home Screen"
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` — required for iOS home screen icon
- Dark mode `<meta name="theme-color">` — only light mode `#ede0cf` exists (line 6 of index.html)

When a mobile user saves razzle.lol to their home screen, they get a generic browser icon instead of Razzle branding. This is a missed brand touchpoint — fantasy football users check their apps daily during season.

## Fix

1. Create a minimal `manifest.json`:
```json
{
  "name": "Razzle",
  "short_name": "Razzle",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ede0cf",
  "theme_color": "#d97757",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

2. Generate icon PNGs from existing mascot art (192px and 512px).

3. Add to `<head>` on all pages:
```html
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/icon-192.png">
```

## Verification

On Android Chrome: visit razzle.lol → three-dot menu → "Add to Home Screen" → Razzle icon and name should appear. On iOS Safari: share → "Add to Home Screen" → Razzle icon should appear.
