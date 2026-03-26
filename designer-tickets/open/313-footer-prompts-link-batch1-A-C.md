<!-- PM: ready -->
---
id: DES-447a
parent: 447 (Footer Prompts Link Epic)
priority: P3
area: navigation
section: footer
type: consistency
status: open
---

# Add /prompts.html to footer — standalone pages A-C

## What to do

For each standalone page from `advantage.html` through `consistency.html` (alphabetically), check if `/prompts.html` is in the footer. If missing, add it to the "Razzle" section to match the main page footer template.

Pages in scope: advantage, aging, airyards, archetypes, auction, awards, breakdown, breakouts, buysell, career-compare, career, cheatsheet, compare, comptable, consistency

## How to find misses

```bash
grep -rL 'prompts.html' frontend/{advantage,aging,airyards,archetypes,auction,awards,breakdown,breakouts,buysell,career-compare,career,cheatsheet,compare,comptable,consistency}.html
```

## Accept when

All 15 pages have `/prompts.html` in the footer, matching main page template.
