---
id: DQ-236
priority: P2
category: data / infrastructure
pages: 70+ standalone pages
status: open
cycle: 33
---

# Analytics pageview format inconsistent — 4 different patterns across 70+ pages

## What's wrong

Pages send pageview analytics with 4 incompatible formats for the `page` parameter:

| Format | Example | Pages using it |
|--------|---------|---------------|
| Bare name | `{ page: 'archetypes' }` | archetypes, auction, breakdown, dashboard |
| Path with slash | `{ page: '/awards.html' }` | awards, airyards, weekly, aging |
| `location.pathname` | `{ page: location.pathname }` | about, agents, rankings |
| Path without slash | `{ page: 'dashboard' }` | dashboard |

This means the analytics backend has 3-4 different entries for the same page (e.g., `dashboard` vs `/dashboard.html` vs `/dashboard`). Any analytics dashboard built on this data will show fragmented pageview counts.

## Evidence

Grep for `page:` in analytics fetch calls across frontend/:
- `archetypes.html:494`: `page: 'archetypes'`
- `awards.html:666`: `page: '/awards.html'`
- `about.html:334`: `page: location.pathname`

## Fix

Standardize all pages to use `location.pathname`:

```js
fetch('/api/analytics/pageview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ page: location.pathname, referrer: document.referrer || '' })
}).catch(function(){});
```

This is a mechanical find-replace across all files.

## Verification

Grep for `page:` in analytics calls. Every instance should use `location.pathname`.
