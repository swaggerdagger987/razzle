---
id: DQ-362
priority: P3
area: frontend/tdregression.html
section: SEO / consistency
type: content mismatch
status: open
---

# tdregression.html title says "Candidates" but H1 just says "TD Regression"

## What's wrong

The `<title>` tag and the `<h1>` tag don't match:
- Line 7: `<title>TD Regression Candidates — Razzle</title>`
- Line 99: `<h1>TD Regression</h1>`

Google shows the title in search results. Users see the H1 on the page. They should say the same thing.

## Suggested fix

Pick one and make both match. "TD Regression" is cleaner:
```html
<title>TD Regression — Razzle</title>
<h1>TD Regression</h1>
```

Or if "Candidates" adds value:
```html
<title>TD Regression Candidates — Razzle</title>
<h1>TD Regression Candidates</h1>
```

One string change.

## Why this matters

Minor SEO/consistency fix. Google may show different text than what the user sees on the page.
