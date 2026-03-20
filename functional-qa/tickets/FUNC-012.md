# FUNC-012: Playoff data contaminates regular season stats (Layer 2 — missing season_type filters)

**Severity**: P0
**Flow**: 1-12 (Screener), 14-15 (Profiles/Game Logs), 18-19 (Dynasty), 25 (Weekly Heatmap), 32-44 (Analytics)
**Status**: RESOLVED — deployed and verified on production (session 12)

## Resolution (2026-03-20 session 12)

**DEPLOYED AND VERIFIED.** Ship Loop merged to master (`da41242`), Render auto-deployed. All 5 RE-AUDIT flows pass on production:

| Check | Before (broken) | After (fixed) | Status |
|-------|-----------------|---------------|--------|
| Lamar Jackson 2024 GP | 19 | **17** | PASS |
| Lamar Jackson 2024 PPR | 471.5 | **430.4** | PASS |
| Josh Allen 2024 GP | 19 | **16** | PASS |
| Joe Burrow 2024 GP | ? | **17** | PASS |
| Saquon Barkley 2024 rush yds | 2504 | **2005** | PASS |
| Saquon Barkley 2024 GP | 20 | **16** | PASS |
| Weekly Heatmap weeks | 1-22 | **1-18** | PASS |
| Game Log Lamar weeks | 1-20 | **1-18** | PASS |
| Stat Leaders Lamar GP | 19 | **17** | PASS |
| Dynasty Bijan Robinson GP | 20 | **17** | PASS |
| Prod smoke tests | 11/11, week=21gp | **11/11, week=16gp** | PASS |

### Post-deploy verification
- 20/20 key pages: 0 JS errors, 0 crashes
- 11/11 smoke tests pass on production
- All 5 RE-AUDIT flows verified with correct data

## Full History

- Session 8: FUNC-012 opened — discovered all player_week_stats queries missing season_type filters
- Session 9: Layer 1 FIXED (DB tags correct), Layer 2 scoped (108+ functions)
- Session 10: No progress — Ship Loop focused on visual/UX
- Session 11: Layer 2 FIXED — Ship Loop added filters to all 6 backend modules
- Session 12: DEPLOYED — merged to master, Render deployed, all verifications pass
