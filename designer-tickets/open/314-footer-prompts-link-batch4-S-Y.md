<!-- PM: ready -->
---
id: DES-447d
parent: 447 (Footer Prompts Link Epic)
priority: P3
area: navigation
section: footer
type: consistency
status: open
---

# Add /prompts.html to footer — standalone pages S-Y

## What to do

For each standalone page from `scarcity.html` through `yoy.html` (alphabetically), check if `/prompts.html` is in the footer. If missing, add it to the "Razzle" section to match the main page footer template.

Pages in scope: scarcity, schedule, scoring, seasonpace, snapefficiency, stacks, stocks, streaks, strengths, successrate, targetpremium, targets, tdregression, team, tiers, tools, tradefinder, tradevalues, usage, vorp, waivers, weekly, weeklyleaders, weeklymvp, workload, yoy

## How to find misses

```bash
grep -rL 'prompts.html' frontend/{scarcity,schedule,scoring,seasonpace,snapefficiency,stacks,stocks,streaks,strengths,successrate,targetpremium,targets,tdregression,team,tiers,tools,tradefinder,tradevalues,usage,vorp,waivers,weekly,weeklyleaders,weeklymvp,workload,yoy}.html
```

## Accept when

All 26 pages have `/prompts.html` in the footer, matching main page template.
