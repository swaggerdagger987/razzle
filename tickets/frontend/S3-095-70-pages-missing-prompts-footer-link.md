---
id: S3-095
severity: S3
confidence: HIGH
category: ux-flow
source: functional-qa/flows.md flow #74 (P2: 70 footer pages missing Prompts link)
status: OPEN
---

# 70 standalone pages missing Prompts footer link — inconsistent nav

## Root Cause

When the Prompts page was added, footer links were only added to `agents.html` and `index.html`. The remaining ~70 standalone HTML files (all pages under `frontend/`) do not have a footer link to `prompts.html`.

Pages that DO have the Prompts footer link: `agents.html`, `index.html`, `aging.html`, `vorp.html`, `archetypes.html`, `auction.html`, `dashboard.html`, `tiers.html` (and likely a few others that were updated in the same batch).

Pages that are MISSING the Prompts footer link: most remaining standalone pages.

## Fix

Batch find-replace across all standalone HTML files in `frontend/`. Locate the footer link section (typically contains links to "The Lab", "Bureau", "Situation Room", "About", "Pricing") and add `<a href="/prompts.html" class="footer-link">Prompts</a>` after the existing links.

Use grep to find files with footer links but no Prompts link:
```bash
grep -rl "footer-link.*Pricing" frontend/*.html | xargs grep -L "prompts.html"
```

## Files to Change

- ~70 HTML files in `frontend/` — add Prompts footer link

## Accept When

1. Every standalone HTML page with a footer has a "Prompts" link
2. Link goes to `/prompts.html`
3. Link uses the same CSS class as other footer links (`footer-link`)
4. Link position is consistent across all pages (after Pricing or About)

## Do NOT Touch

- Footer layout or styling
- Pages that already have the Prompts footer link
- lab.html (handled via sidebar, not footer)
