---
id: DES-215
title: Search hint shows "Ctrl+K" on Mac — should adapt to platform
priority: P3
category: ux-polish
page: sitewide (75 pages)
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

The nav search button and command palette placeholder both hardcode "Ctrl+K" text. On Mac, the correct shortcut indicator is "⌘K". The keyboard HANDLER correctly uses `e.ctrlKey || e.metaKey` (app.js line 1478), but the display text doesn't adapt.

## Evidence

Every page's nav has (e.g., index.html line 635):
```html
<button class="nav-search-hint" aria-label="Open quick search (Ctrl+K)">
  <kbd>Ctrl+K</kbd> Search
</button>
```

Command palette placeholder (app.js line 1427):
```js
'<input ... placeholder="Search players... (Ctrl+K)" />'
```

Neither checks `navigator.platform` or `navigator.userAgentData.platform` to show the platform-appropriate modifier key.

## Why it matters

The target audience (22-40, tech-comfortable) includes a significant Mac user base. Showing "Ctrl+K" to Mac users is a small but visible UX polish miss — it signals the developer didn't test on Mac. Power users notice keyboard shortcut labels.

## Fix

In app.js, detect Mac and update the text:

```js
var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
var modKey = isMac ? '⌘' : 'Ctrl+';
```

Apply to:
1. Nav search button `<kbd>` text and `aria-label`
2. Command palette input placeholder

Since app.js generates the nav search hint dynamically, both can be fixed in one place.

## Scope

app.js — 2-3 string replacements + 1 platform detection line.
