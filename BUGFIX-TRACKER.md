# Bugfix Tracker

## Priority Pages
| Page | Status | Fixes |
|------|--------|-------|
| index.html | DONE | XSS: escape playerName from localStorage in CTA personalization (escapeHtml unavailable before app.js loads); Canvas perf: mini War Room animation now pauses when scrolled off-screen via IntersectionObserver |
| lab.html | DONE | Missing PANEL_LABELS/PANEL_FLAVORS for powerrankings and gamescript (broken breadcrumbs); hardcoded leader dot colors (#ffc857/#c4b5a5/#d97757) replaced with CSS vars (--yellow/--ink-faint/--orange); cold blue-black overlay rgba(15,15,26) replaced with warm espresso rgba(45,31,20); cold rgba(26,26,46) replaced with warm rgba(45,31,20); ctx-sep 1px border fixed to 2px; hardcoded heatmap legend colors replaced with CSS vars |
| league-intel.html | DONE | Missing resp.ok check on loadLeagues fetch; hardcoded pressure map hex colors (#e63946/#d97757/#2ec4b6) replaced with CSS vars (--red/--orange/--green); hardcoded canvas colors in renderActivityTimeline and drawCompareRadar replaced with cssVar() helper using getComputedStyle; XSS fix — onclick prefillScenario handlers used escapeHtml+replace which double-decoded via HTML parser, replaced with escapeJsString() for proper JS-in-attribute escaping |
| agents.html | PENDING | |
| pricing.html | PENDING | |
| about.html | PENDING | |
| 404.html | PENDING | |

## Shared JS/CSS
| File | Status | Fixes |
|------|--------|-------|
| app.js | PENDING | |
| styles.css | PENDING | |
| lab.js | PENDING | |
| lab-panels.js | PENDING | |
| lab-panels.css | PENDING | |
| warroom.js | PENDING | |
| charts.js | PENDING | |
| formulas.js | PENDING | |
| formula-store.js | PENDING | |
| compare.js | PENDING | |
| player.js | PENDING | |

## Remaining HTML (alphabetical)
| Page | Status | Fixes |
|------|--------|-------|
| advantage.html | PENDING | |
| aging.html | PENDING | |
| airyards.html | PENDING | |
| archetypes.html | PENDING | |
| auction.html | PENDING | |
| awards.html | PENDING | |
| breakdown.html | PENDING | |
| breakouts.html | PENDING | |
| buysell.html | PENDING | |
| career-compare.html | PENDING | |
| career.html | PENDING | |
| cheatsheet.html | PENDING | |
| compare.html | PENDING | |
| comptable.html | PENDING | |
| consistency.html | PENDING | |
| dashboard.html | PENDING | |
| draftclass.html | PENDING | |
| drops.html | PENDING | |
| dualthreat.html | PENDING | |
| efficiency.html | PENDING | |
| explorer.html | PENDING | |
| fptsbreakdown.html | PENDING | |
| gamelog.html | PENDING | |
| gamescript.html | PENDING | |
| garbagetime.html | PENDING | |
| handcuffs.html | PENDING | |
| leaders.html | PENDING | |
| matchups.html | PENDING | |
| opportunity.html | PENDING | |
| pace.html | PENDING | |
| percentiles.html | PENDING | |
| player.html | PENDING | |
| playoffs.html | PENDING | |
| prospects.html | PENDING | |
| rankings.html | PENDING | |
| recap.html | PENDING | |
| records.html | PENDING | |
| redzone.html | PENDING | |
| regression.html | PENDING | |
| reportcard.html | PENDING | |
| rosterbuilder.html | PENDING | |
| scarcity.html | PENDING | |
| schedule.html | PENDING | |
| scoring.html | PENDING | |
| seasonpace.html | PENDING | |
| snapefficiency.html | PENDING | |
| stacks.html | PENDING | |
| stocks.html | PENDING | |
| streaks.html | PENDING | |
| strengths.html | PENDING | |
| successrate.html | PENDING | |
| targetpremium.html | PENDING | |
| targets.html | PENDING | |
| tdregression.html | PENDING | |
| team.html | PENDING | |
| tiers.html | PENDING | |
| tools.html | PENDING | |
| tradefinder.html | PENDING | |
| tradevalues.html | PENDING | |
| usage.html | PENDING | |
| vorp.html | PENDING | |
| waivers.html | PENDING | |
| weekly.html | PENDING | |
| weeklyleaders.html | PENDING | |
| weeklymvp.html | PENDING | |
| workload.html | PENDING | |
| yoy.html | PENDING | |

## Backend
| File | Status | Fixes |
|------|--------|-------|
| server.py | PENDING | |
| live_data/ | PENDING | |
