<!-- PM: ready -->
---
id: DES-447c
parent: 447 (Footer Prompts Link Epic)
priority: P3
area: navigation
section: footer
type: consistency
status: open
---

# Add /prompts.html to footer — standalone pages H-R

## What to do

For each standalone page from `handcuffs.html` through `rosterbuilder.html` (alphabetically), check if `/prompts.html` is in the footer. If missing, add it to the "Razzle" section to match the main page footer template.

Pages in scope: handcuffs, leaders, matchups, opportunity, pace, percentiles, player, playoffs, prospects, rankings, recap, records, redzone, regression, reportcard, rosterbuilder

## How to find misses

```bash
grep -rL 'prompts.html' frontend/{handcuffs,leaders,matchups,opportunity,pace,percentiles,player,playoffs,prospects,rankings,recap,records,redzone,regression,reportcard,rosterbuilder}.html
```

## Accept when

All 16 pages have `/prompts.html` in the footer, matching main page template.
