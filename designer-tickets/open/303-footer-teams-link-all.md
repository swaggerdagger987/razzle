<!-- PM: ready -->
---
id: DES-349
parent: 349 (Footer Teams Link Epic)
priority: P3
area: all frontend HTML pages
section: footer navigation
type: ux / navigation
status: open
pm_note: consolidated from DES-349a + DES-349b + DES-349c — one search-and-replace, not 3 tickets
---

# Remove hardcoded /team/KC footer link from all pages

**Scope**: All `frontend/*.html` files

## PM decision

Remove the "Teams" footer link entirely. There is no teams index page, and linking to a single arbitrary team (/team/KC) is confusing. Re-add when a proper /teams.html index exists.

## What to do

1. Search all HTML files for `/team/KC` in footer sections
2. Remove the "Teams" link from each footer
3. Verify: `grep -rn "/team/KC" frontend/*.html` — remaining matches should only be in non-footer contexts (e.g., team roster content links)

## Accept when

- Zero `/team/KC` matches in `<footer>` sections across all pages
- Non-footer `/team/KC` links (team roster content) are untouched
- Footer layout doesn't break (no empty gaps)
