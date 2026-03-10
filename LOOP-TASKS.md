# Razzle Consolidation -- Task Tracker

## Current State
- Phase: 4 (Inline Panel Migration)
- Task: Migrate Rankings & Values panels
- Stage: BUILD
- Attempt: 1/3
- Tasks Done: 4/10

## Phase 1: Navigation Surgery -- COMPLETE
### Task 1: Slim nav to 4 items on all pages
**Status**: PASS

## Phase 2: The Lab Sidebar -- COMPLETE
### Task 1: Sidebar shell + panel infrastructure
**Status**: PASS

### Task 2: Smart redirects from standalone pages
**Status**: PASS

## Phase 3: Season Expansion -- COMPLETE
### Task 1: Expand data ranges to 2015+
**Status**: PASS

## Phase 4: Inline Panel Migration — iframe → native render
**Exit Criterion**: Every Lab panel renders natively in lab.js with no iframes. Each panel has its own render function that fetches from the API and builds the DOM directly. Panel switching is instant (cached after first load). No page reloads.

### Task 1: Audit current iframe panels
**Requirement**: Identify every panel in lab.html that currently loads via iframe. List each one with its source HTML file, API endpoint, and render complexity (S/M/L).
**Accept when**: A complete list exists in LOOP-TASKS.md with all iframe panels cataloged.
**Depends on**: none
**Size**: S
**Status**: PASS
**Attempts**: 1

#### Audit Results — 62 iframe panels + 1 inline (screener)

**Rankings & Values (7 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Dynasty Rankings | rankings.html | /api/dynasty-rankings | M |
| Tiers | tiers.html | /api/tier-list | S |
| Trade Values | tradevalues.html | /api/trade-value-chart | L |
| VORP | vorp.html | /api/vorp | M |
| Positional Advantage | advantage.html | /api/positional-advantage | M |
| Auction Values | auction.html | /api/auction-values | M |
| Cheat Sheet | cheatsheet.html | /api/cheat-sheet | M |

**Discovery (6 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Breakouts | breakouts.html | /api/breakout-candidates | M |
| Buy / Sell | buysell.html | /api/buy-sell-candidates | S |
| Stock Watch | stocks.html | /api/stock-watch | M |
| Waivers | waivers.html | /api/waivers | M |
| Scarcity | scarcity.html | /api/positional-scarcity | M |
| Handcuffs | handcuffs.html | /api/handcuffs | M |

**Performance (9 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Efficiency | efficiency.html | /api/efficiency-rankings | M |
| Consistency | consistency.html | /api/consistency-rankings | M |
| Snap Efficiency | snapefficiency.html | /api/snap-efficiency | M |
| Workload Monitor | workload.html | /api/workload-monitor | M |
| Dual-Threat | dualthreat.html | /api/dual-threat | M |
| Target Premium | targetpremium.html | /api/target-premium | M |
| Drop Rate | drops.html | /api/drop-rate | M |
| Garbage Time | garbagetime.html | /api/garbage-time | M |
| Success Rate | successrate.html | /api/success-rate | M |

**Game Analysis (8 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Weekly Heatmap | weekly.html | /api/weekly-heatmap | M |
| Matchups | matchups.html | /api/matchup-heatmap | M |
| Stacks | stacks.html | /api/stacks | M |
| Red Zone | redzone.html | /api/redzone-usage | M |
| Streaks | streaks.html | /api/streaks | M |
| Weekly Leaders | weeklyleaders.html | /api/weekly-leaders | M |
| Weekly MVP Grid | weeklymvp.html | /api/weekly-mvp | M |
| Playoffs | playoffs.html | /api/playoff-schedule | M |

**Trends & Projections (7 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Usage Trends | usage.html | /api/usage-trends | L |
| Year-over-Year | yoy.html | /api/year-over-year | M |
| Aging Curves | aging.html | /api/aging-curves | L |
| Pace Tracker | pace.html | /api/pace-tracker | M |
| Season Pace | seasonpace.html | /api/season-pace | M |
| TD Regression | tdregression.html | /api/td-regression | M |
| Air Yards | airyards.html | /api/air-yards | M |

**Prospects & College (3 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Big Board | prospects.html | /api/prospect-scores | M |
| Draft Class Analytics | draftclass.html | /api/draft-class | L |
| Percentiles | percentiles.html | /api/player-percentiles | S |

**Player Tools (9 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Career Stats | career.html | /api/career-stats | L |
| Career Compare | career-compare.html | /api/career-stats | L |
| Compare Table | comptable.html | /api/compare-table | M |
| Strengths | strengths.html | /api/player-strengths | S |
| Report Card | reportcard.html | /api/report-cards | M |
| FPTS Breakdown | fptsbreakdown.html | /api/fpts-breakdown | S |
| Game Log | gamelog.html | /api/game-log | M |
| Archetypes | archetypes.html | /api/player-archetypes | S |
| Scoring Breakdown | breakdown.html | /api/points-breakdown | L |

**League Tools (6 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Roster Builder | rosterbuilder.html | /api/roster-grade | M |
| Trade Finder | tradefinder.html | /api/trade-finder | M |
| Scoring Comparison | scoring.html | /api/scoring-comparison | M |
| Dashboard | dashboard.html | /api/dynasty-dashboard | M |
| Schedule / SOS | schedule.html | /api/strength-of-schedule | M |
| Opportunity Share | opportunity.html | /api/opportunity-share | M |

**Records & History (5 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Records | records.html | /api/records | M |
| Season Recap | recap.html | /api/season-recap | M |
| Awards | awards.html | /api/season-awards | M |
| Stat Leaders | leaders.html | /api/stat-leaders | M |
| Explorer | explorer.html | /api/stat-explorer | L |

**Teams (2 panels)**
| Panel | File | API Endpoint | Complexity |
|-------|------|-------------|-----------|
| Target Distribution | targets.html | /api/target-distribution | S |
| Team Rosters | team.html | /api/team-roster | S |

**Summary**: 62 iframe panels (8 S, 45 M, 9 L) + 1 inline screener = 63 total panels

### Task 2: Create panel render infrastructure
**Requirement**: Build a panel registry and switching system in lab.js. Each panel gets: a `<section data-panel="name">` container, a render function, a loaded flag, and lazy-load on first click. URL updates with `?panel=name`. Browser back/forward works.
**Accept when**: `switchPanel(name)` function works, URL state syncs, and at least the screener panel renders natively through the new system.
**Depends on**: Task 1
**Size**: M
**Status**: PASS
**Attempts**: 1

### Task 3: Migrate Rankings & Values panels
**Requirement**: Convert these panels from iframe to native render: Dynasty Rankings, Tiers, Trade Values, VORP, Positional Advantage, Auction Values, Cheat Sheet. Port each page's fetch + render logic into lab.js as dedicated render functions.
**Accept when**: All 7 panels render natively with correct data, sorting, filtering, and design system compliance. No iframes.
**Depends on**: Task 2
**Size**: L
**Status**: PASS
**Attempts**: 1

### Task 4: Migrate Discovery panels
**Requirement**: Convert: Breakouts, Buy/Sell, Stock Watch, Waivers, Scarcity, Handcuffs. Port fetch + render logic.
**Accept when**: All 6 panels render natively. Data matches standalone page output.
**Depends on**: Task 2
**Size**: L
**Status**: PASS
**Attempts**: 1

### Task 5: Migrate Performance panels
**Requirement**: Convert: Efficiency, Consistency, Snap Efficiency, Workload Monitor, Dual-Threat, Target Premium, Drop Rate, Garbage Time.
**Accept when**: All 8 panels render natively.
**Depends on**: Task 2
**Size**: L
**Status**: PENDING
**Attempts**: 0

### Task 6: Migrate Game Analysis panels
**Requirement**: Convert: Weekly Heatmap, Matchups, Stacks, Red Zone, Streaks, Weekly Leaders, Weekly MVP Grid, Playoffs.
**Accept when**: All 8 panels render natively. Chart.js visualizations work within panel containers.
**Depends on**: Task 2
**Size**: L
**Status**: PENDING
**Attempts**: 0

### Task 7: Migrate Trends & Projections panels
**Requirement**: Convert: Usage Trends, Year-over-Year, Aging Curves, Pace Tracker, Season Pace, TD Regression, Air Yards.
**Accept when**: All 7 panels render natively. Line charts and trend visualizations work.
**Depends on**: Task 2
**Size**: L
**Status**: PENDING
**Attempts**: 0

### Task 8: Migrate Player Tools panels
**Requirement**: Convert: Career Stats, Career Compare, Compare Table, Strengths, Report Card, FPTS Breakdown, Game Log, Scoring Breakdown. Player Profile remains search-activated.
**Accept when**: All 8 panels render natively. Player search within panels works.
**Depends on**: Task 2
**Size**: L
**Status**: PENDING
**Attempts**: 0

### Task 9: Migrate remaining panels
**Requirement**: Convert: Prospects/Big Board, Draft Class, College Production, Percentiles, Roster Builder, Trade Finder, Scoring Comparison, Dashboard, League Intel, Schedule/SOS, Records, Season Recap, Awards, Stat Leaders, Explorer, Teams.
**Accept when**: All remaining panels render natively. Zero iframes in lab.html.
**Depends on**: Task 2
**Size**: L
**Status**: PENDING
**Attempts**: 0

### Task 10: Remove iframe fallbacks and clean up
**Requirement**: Remove all iframe loading code from lab.js. Remove any iframe-specific CSS. Verify every panel loads, renders, and caches correctly. Test panel switching performance (should be <100ms for cached panels).
**Accept when**: Zero iframes in lab.html. All 60+ panels work. No dead code from old iframe system.
**Depends on**: Tasks 3-9
**Size**: M
**Status**: PENDING
**Attempts**: 0
