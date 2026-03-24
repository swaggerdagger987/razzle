---
id: DQ-366
priority: P3
area: frontend/dualthreat.html
section: loading state
type: brand voice inconsistency
status: open
---

# dualthreat.html uses custom "crunching the data..." not in RAZZLE_LOADING array

## What's wrong

dualthreat.html:109 uses `"crunching the data..."` as its loading text. This string is not in the `RAZZLE_LOADING` personality array in app.js, and it doesn't match any of the established loading phrases ("pulling film...", "checking the tape...", "running the numbers...").

By contrast, advantage.html correctly uses `razzleLoading()` to pull from the centralized set.

## Where

`frontend/dualthreat.html` line 109:
```html
<div id="dt-loading" class="dt-loading" style="font-family:var(--font-hand);">crunching the data...</div>
```

## Suggested fix

Either:
1. Replace with `razzleLoading()` call (preferred — uses the centralized personality system)
2. Or add "crunching the data..." to the RAZZLE_LOADING array in app.js if you want to keep it

Option 1 is better — one source of truth for loading personality.

## Why this matters

Minor brand voice consistency. Every page should use the same personality system so loading text feels intentional, not ad-hoc.
