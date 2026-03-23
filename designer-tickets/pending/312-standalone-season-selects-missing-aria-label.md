---
id: DES-312
title: 6 standalone page season-selects missing aria-label
priority: P2
page: archetypes.html, auction.html, cheatsheet.html, dashboard.html, scoring.html, tiers.html
category: Accessibility
cycle: 28
---

## Problem

20+ standalone panel pages have `aria-label="Season"` on their season-select dropdown. Six pages don't — inconsistent accessibility across the same UI pattern.

## Where

**Missing aria-label (6 pages):**
1. `frontend/archetypes.html:280` — `<select id="season-select"></select>`
2. `frontend/auction.html:336` — `<select id="season-select"></select>`
3. `frontend/cheatsheet.html:265` — `<select class="cs-season-select" id="season-select"></select>`
4. `frontend/dashboard.html:349` — `<select id="season-select" style="...">`
5. `frontend/scoring.html:292` — `<select class="sc-season-select" id="season-select"></select>`
6. `frontend/tiers.html:291` — `<select id="season-select"></select>`

**Correct pattern (examples):**
- `aging.html:326` — `<select ... id="season-select" title="Season" aria-label="Season">`
- `breakouts.html:384` — `<select ... id="season-select" title="Season" aria-label="Season">`
- 20+ other pages follow this pattern

## Fix

Add `title="Season" aria-label="Season"` to all 6 missing selects. Copy-paste from any correct page.

## Evidence

- 20+ pages have `aria-label="Season"` ✅
- 6 pages are missing it ❌
- Screen readers announce these as unlabeled dropdowns
