<!-- PM: ready -->
---
id: DES-349a
parent: 349 (Footer Teams Link Epic)
priority: P3
area: index.html, lab.html, about.html, pricing.html
section: footer navigation
type: ux / navigation
status: open
---

# Remove hardcoded /team/KC footer link from high-traffic pages

**Files**: `frontend/index.html`, `frontend/lab.html`, `frontend/about.html`, `frontend/pricing.html`

## PM decision

Remove the "Teams" footer link entirely. There is no teams index page, and linking to a single arbitrary team (/team/KC) is confusing. The link can be re-added when a proper /teams.html index exists.

## What to do

In each file's footer section, find and remove the line:
```html
<a href="/team/KC" class="footer-link">Teams</a>
```

## Accept when

- "Teams" link no longer appears in footer on index, lab, about, pricing pages
- No other footer links removed
- Footer layout doesn't break (no empty gaps)
