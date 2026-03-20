# FUNC-012: Playoff data contaminates regular season stats (Layer 2 — missing season_type filters)

**Severity**: P0
**Flow**: 1-12 (Screener), 14-15 (Profiles/Game Logs), 18-19 (Dynasty), 25 (Weekly Heatmap), 32-44 (Analytics)
**Status**: CODE FIXED — awaiting production deployment

## Status Update (2026-03-20 session 11)

**LAYER 2 IS FIXED IN CODE.** Ship Loop commits `cdcb673`, `d235039`, `8acfebe` added `season_type = 'regular'` filters across all 6 backend modules. Comprehensive code audit + local API verification confirms the fix.

### Code Audit Results

| File | Before (sessions 8-10) | After (session 11) | Status |
|------|----------------------|---------------------|--------|
| `players.py` | **0** filters | **20** filters | FIXED |
| `dynasty.py` | **0** filters | **15** filters | FIXED |
| `analytics.py` | 3 filters | **23** filters | FIXED |
| `tools.py` | 5 filters | **29** filters | FIXED |
| `dashboards.py` | already filtered | **16** filters | VERIFIED |
| `core.py` | already filtered | **3** filters | VERIFIED |

### Local API Verification (against Ship Loop code)

| Player | Production (broken) | Local (fixed) | Expected |
|--------|-------------------|---------------|----------|
| Lamar Jackson 2024 | 19 GP, 471.5 PPR | **17 GP, 430.4 PPR** | 17 GP |
| Josh Allen 2024 | 19 GP, 438.3 PPR | **16 GP, 379.0 PPR** | 16 GP |
| Jayden Daniels 2024 | 20 GP, 428.2 PPR | **17 GP, 355.8 PPR** | 17 GP |
| Saquon Barkley 2024 | 2504 rush yds | **2005 rush yds** | 2005 |
| Weekly Heatmap weeks | 1-22 | **1-18** | 1-18 |
| Stat Leaders Lamar | 19 GP | **17 GP** | 17 |
| Dynasty Ja'Marr Chase | ? | **17 GP** | 17 |
| Dynasty Saquon Barkley | 20 GP | **16 GP** | 16 |
| Game Log Lamar | weeks 1-20 | **weeks 1-18** | 1-18 |

### Smoke Tests

- Local: 11/11 passed, week_filter=17gp (was 21gp)
- Production: 11/11 passed but week_filter still shows inflated counts (not deployed)

### Remaining Action

**Deploy to production.** The code fix is complete and verified. Once deployed, re-run smoke tests + browser verification against razzle.lol to confirm.

### Credibility Risk — RESOLVED (pending deploy)

The Barkley 2504 rush yards issue (actual 2005, +25% inflation) that threatened Reddit credibility is fixed in code. Once deployed, all stat values will be regular-season only.

## Previous History

- Session 8: FUNC-012 opened — discovered all player_week_stats queries missing season_type filters
- Session 9: Layer 1 FIXED (DB tags correct), Layer 2 scoped (108+ functions)
- Session 10: No progress — Ship Loop focused on visual/UX
- Session 11: Layer 2 FIXED — Ship Loop added filters to all 6 backend modules
