# DES-093: Screener result count and loading state missing aria-live

**Priority**: P2
**Area**: frontend/lab.html lines 3396 and 3450
**Cycle**: 9

## Problem

Two key dynamic content areas in the Lab Screener update without being announced to screen readers:

### 1. Result count (#resultCount, line 3396)

```html
<span class="result-count" id="resultCount"></span>
```

When the screener fetches results, this span updates to show "127 players" or "QB: 12 RB: 45 WR: 62 TE: 18". Screen readers don't announce the change — users who can't see the screen don't know results loaded or how many matched.

### 2. Loading text (#loadingText, line 3450)

```html
<div id="loadingText" ...>pulling film...</div>
```

When loading starts, this text appears. When it's replaced by results, screen readers are silent about both transitions.

## Fix

Add `aria-live="polite"` to the result count container:

```html
<span class="result-count" id="resultCount" aria-live="polite"></span>
```

Add `aria-live="polite"` and `role="status"` to the loading text:

```html
<div id="loadingText" role="status" aria-live="polite" ...>pulling film...</div>
```

Use `polite` (not `assertive`) — these are informational updates, not urgent alerts. The screen reader will announce when there's a pause in the user's activity.

## Design Rule

WCAG 2.1 SC 4.1.3: Status Messages. When content updates dynamically (search results, loading states), it must be announced to assistive technology via aria-live regions.
