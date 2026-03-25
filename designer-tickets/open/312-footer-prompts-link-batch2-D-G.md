<!-- PM: ready -->
---
id: DES-447b
parent: 447 (Footer Prompts Link Epic)
priority: P3
area: navigation
section: footer
type: consistency
status: open
---

# Add /prompts.html to footer — standalone pages D-G

## What to do

For each standalone page from `dashboard.html` through `garbagetime.html` (alphabetically), check if `/prompts.html` is in the footer. If missing, add it to the "Razzle" section to match the main page footer template.

Pages in scope: dashboard, draftclass, drops, dualthreat, efficiency, explorer, fptsbreakdown, gamelog, gamescript, garbagetime

## How to find misses

```bash
grep -rL 'prompts.html' frontend/{dashboard,draftclass,drops,dualthreat,efficiency,explorer,fptsbreakdown,gamelog,gamescript,garbagetime}.html
```

## Accept when

All 10 pages have `/prompts.html` in the footer, matching main page template.
