<!-- PM: ready -->
---
id: DES-447-all
parent: 447 (Footer Prompts Link Epic)
priority: P3
area: navigation
section: footer
type: consistency
status: open
pm_note: consolidated from DES-447a/b/c/d — same mechanical operation, no reason for 4 tickets
root_cause: RC-003 (footer template drift) — will be obsoleted when shared footer ships
---

# Add /prompts.html to footer — all standalone pages

## What to do

For every standalone page in `frontend/*.html`, check if `/prompts.html` is in the footer. If missing, add it to the "Razzle" section to match the main page footer template.

## How to find misses

```bash
grep -rL 'prompts.html' frontend/*.html
```

Filter out non-standalone pages (index.html, lab.html, etc.) from the results.

## Accept when

- `grep -rL 'prompts.html' frontend/*.html` returns only pages that intentionally omit it (index, lab, warroom, league-intel, agents)
- Footer layout doesn't break on any page

## Root cause

RC-003 (footer template drift) — no shared footer template, each page has its own copy. This ticket is a band-aid; will be obsoleted when RC-003 ships.
