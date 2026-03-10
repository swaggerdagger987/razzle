# QA + UX Audit — Phases 61-65

**Date**: 2026-03-10
**Audited Phases**: 61 (QA+UX fixes), 62 (Quick Search), 63 (Dynasty Rankings), 64 (Stat Leaders), 65 (Team Roster Pages)

---

## QA FINDINGS

### CRITICAL

**Q1. `fantasy_relevant` column may not exist in DB schema**
- File: `backend/live_data.py` lines 3445, 3568, 3589, 3608, 3627
- Queries in `fetch_dynasty_rankings`, `fetch_stat_leaders`, and `_fetch_featured_uncached` filter on `p.fantasy_relevant = 1`. This column may not exist in a fresh deploy (Render builds DB from scratch). If missing, these endpoints return zero players.
- Fix: Add `fantasy_relevant` to `migrate_add_columns` in nflverse_adapter.py, OR remove the filter and rely on `position IN ('QB','RB','WR','TE')` which accomplishes the same goal.

**Q2. SQL injection pattern in `fetch_stat_leaders` position filter**
- File: `backend/live_data.py` line 3547
- Position filter built via f-string: `pos_where = f"AND p.position = '{pos_upper}'"`. While validated to QB/RB/WR/TE, the f-string pattern is fragile.
- Fix: Use parameterized queries with `?` placeholders.

**Q3. Connection leak in `fetch_stat_leaders`**
- File: `backend/live_data.py` lines 3527, 3672
- Opens `conn` at 3527, closes at 3669, then opens `conn2` at 3672 for seasons. No try/finally. If exception occurs, connection leaks.
- Fix: Use try/finally or combine into single connection session.

### HIGH

**Q4. `trackPageview` function undefined on team.html and leaders.html**
- File: `frontend/team.html` line 585, `frontend/leaders.html` line 531
- Both call `trackPageview()` which doesn't exist. Rankings.html uses inline fetch instead (different approach). Pageviews silently not tracked.
- Fix: Standardize on inline fetch pattern (like rankings.html) or define `trackPageview` in app.js.

**Q5. Double DB connection in `fetch_stat_leaders`**
- File: `backend/live_data.py` lines 3527 + 3672
- Opens second connection just for seasons query after closing first. Wasteful.
- Fix: Move seasons query before `conn.close()`.

**U1. Dynasty value number on rankings.html has no label**
- A bold number appears next to each player with zero explanation. Reddit viewers can't understand what the number means from a screenshot alone.
- Fix: Add "DVS" label next to the value. Add one-line methodology note in page header.

**U3. Rankings page lacks DVS methodology explainer**
- "DVS" is a Razzle-specific metric no fantasy player has encountered. Rankings page has no explanation.
- Fix: Add info badge or tooltip explaining "Dynasty Value Score = production x age curve."

### MEDIUM

**Q6. Internal divider borders could be chunkier**
- File: `frontend/team.html` lines 121, 199
- Age badge and group count use `1px solid` borders. Design guide says 2px minimum for small elements.
- Fix: Change to `2px solid` on badges.

**Q7. Rankings PNG export silent failure**
- File: `frontend/rankings.html` lines 442-453
- If html2canvas CDN fails to load, nothing happens. No error feedback.
- Fix: Add `onerror` handler on script element.

**U4. "PPG" vs "PPR/G" inconsistency across pages**
- Team page uses "PPG", player profile uses "PPR/G", rankings uses "ppg" lowercase. Confusing.
- Fix: Standardize on "PPG" everywhere with tooltip "PPR Points Per Game."

**U5. Age badge terminology differs between pages**
- Team page: "young/mid/old". Rankings page: "young/prime/aging". Same thresholds, different words.
- Fix: Standardize on "Young / Prime / Aging" everywhere.

**U6. Profile overlay lacks "Open full profile" link**
- Lab overlay shows player data but no link to standalone /player/{id} page.
- Fix: Add "View full profile" button that opens /player/{id}.

**U7. Back navigation is hardcoded to "Back to The Lab"**
- Clicking a player from rankings/leaders/team pages leads to profile with "Back to The Lab" link regardless of origin.
- Fix: Make back link contextual based on referrer.

**U8. Leaders "All" view shows rate stats that only apply to specific positions**
- Target_share and yards_per_carry appear in "All" view but only make sense for specific positions.
- Fix: Hide rate stats when "All" is selected, show them only with position filters.

### LOW

**Q10. Analytics tracking inconsistent across pages**
- Rankings.html uses inline fetch, team.html/leaders.html use undefined `trackPageview`.

**Q11. Team/season selector borders use 2px instead of 3px**
- Minor design inconsistency; 2px is acceptable for form elements.

**U10. Error messages lack retry button**
**U11. First-visit Lab toast only shows for 6 seconds**
**U12. "CAV" column label is cryptic**

---

## Summary

| Severity | QA | UX | Total |
|----------|----|----|-------|
| CRITICAL | 3 | 0 | 3 |
| HIGH | 2 | 2 | 4 |
| MEDIUM | 2 | 5 | 7 |
| LOW | 2 | 3 | 5 |
| **Total** | **9** | **10** | **19** |
