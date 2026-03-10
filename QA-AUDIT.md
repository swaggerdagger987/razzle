# QA + UX Audit — Phases 81-85

**Audit Date**: 2026-03-10
**Phases Covered**: 81 (QA fixes), 82 (Red Zone), 83 (Efficiency), 84 (Consistency), 85 (Strength of Schedule)
**Files Audited**: redzone.html, efficiency.html, consistency.html, schedule.html, server.py (lines 1158-1207), live_data.py (lines 6034-6718)

---

## QA FINDINGS

### HIGH

1. **SOS endpoint uses `display_name` instead of `full_name`** — `backend/live_data.py` line 6593: `fetch_strength_of_schedule` selects `p.display_name` while all other phase 82-84 endpoints use `p.full_name`. SOS page shows abbreviated names (e.g., "J.Smith") while other pages show full names ("John Smith"). **Fix**: Change `p.display_name` to `p.full_name`.

2. **SOS endpoint missing `fantasy_relevant = 1` filter** — `backend/live_data.py` line 6598: The SOS player query doesn't include `AND p.fantasy_relevant = 1`, unlike redzone (line 6065), efficiency (line 6239), and consistency (line 6399). Could include inactive/irrelevant players. **Fix**: Add `AND p.fantasy_relevant = 1` to the WHERE clause.

### MEDIUM

3. **Efficiency YAC/Rec can display negative values** — `backend/live_data.py` line 6286: `(rec_yards - air_yards) / receptions` can produce negative values when air yards exceeds actual receiving yards. Creates confusing negative YAC values in the UI. **Fix**: Clamp to `max(0, ...)`.

4. **Consistency uses population variance instead of sample variance** — `backend/live_data.py` line 6442: `/ n` instead of `/ (n - 1)` (Bessel's correction). For 6-game samples, underestimates true variance by ~17%. **Fix**: Change to `/ (n - 1)`.

5. **Efficiency "Y/Tch" column header cryptic** — `frontend/efficiency.html` line 427: "Y/Tch" abbreviation is unclear to casual fantasy players. Tooltip exists but screenshots lose tooltips. **Fix**: Rename label to "Yd/Tch" or "YPT".

6. **Consistency CoV displayed as raw decimal (0.342) instead of percentage** — `frontend/consistency.html` line 488: CoV as "0.342" doesn't immediately communicate meaning. "34.2%" would be more intuitive. **Fix**: Multiply by 100 and display with 1 decimal + "%" suffix.

### LOW

7. **Position tab borders use 2px instead of 3px** — All 4 new pages: Tab container borders use `2px solid var(--ink)` while DESIGN.md specifies 3px for borders. Arguably appropriate for smaller UI elements — no action needed.

8. **No "Home" link in page footers** — All 4 new pages: Footer nav links start with "The Lab" but don't include Home. Users can use the logo. Minor inconsistency.

9. **Imports inside function bodies** — `import math` and `from collections import defaultdict` inside consistency and SOS functions. Works but unconventional. No functional impact.

---

## UX FINDINGS

### MEDIUM

1. **Consistency CoV number lacks intuitive meaning** — A casual dynasty user seeing "CoV: 0.342" won't know if that's good or bad without context. The grade badge helps, but the raw number is opaque. Displaying as "34.2%" with color tinting would add immediate comprehension.

2. **Efficiency Catch Rate shows 0% for pure rushers** — `frontend/efficiency.html` line 490: When a player has 0 targets, catch rate displays as "-", which is correct. But the column still appears for RBs who are primarily rushers, adding visual noise.

### LOW

3. **Default sort arrow direction could confuse** — Consistency rock_solid sorts ascending CoV (▲), which is correct (lowest = best) but ▲ usually implies "highest first" in other tables. No action needed — behavior is correct.

4. **Schedule page "cupcake" annotation may be unclear to non-US users** — "cupcake schedule" is US sports slang. The meaning is clear from context. No action needed.

---

## SUMMARY

| Severity | QA | UX | Total |
|----------|----|----|-------|
| CRITICAL | 0  | 0  | 0     |
| HIGH     | 2  | 0  | 2     |
| MEDIUM   | 4  | 2  | 6     |
| LOW      | 3  | 2  | 5     |
| **Total**| **9** | **4** | **13** |

All previous Phase 76-80 CRITICAL/HIGH issues were resolved in Phase 81. No new CRITICALs found. Two HIGH backend data issues need fixing (SOS name field + missing filter).
