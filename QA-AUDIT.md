# QA + UX Audit — Phases 101-104

**Date**: 2026-03-10
**Phases audited**: 101 (Auction Values), 102 (Dynasty Dashboard), 103 (Tier List), 104 (Player Archetypes)

---

## QA FINDINGS

### QA-1: Auction value math inflates dollar values beyond budget (HIGH)
- **File**: backend/live_data.py line 8866
- **Issue**: Formula `(tv / total_tv) * allocatable * roster_size` multiplies by roster_size across ALL players, not just a team's roster. Top players get inflated values.
- **Fix**: Divide by roster_size — allocate proportionally so top N players sum to budget.

### QA-2: Dashboard missing season selector (HIGH)
- **File**: frontend/dashboard.html, backend/live_data.py fetch_dynasty_dashboard
- **Issue**: No available_seasons returned, no season selector on page. Locked to latest season.
- **Fix**: Add available_seasons query + season select dropdown.

### QA-3: Trailing & in URL construction (MEDIUM)
- **Files**: frontend/tiers.html line 470, frontend/archetypes.html line 466
- **Issue**: URL ends with trailing & when position is empty.
- **Fix**: Build URL params array, join with &.

### QA-4: Dashboard #12 label hard-coded in scarcity section (MEDIUM)
- **File**: frontend/dashboard.html line 613
- **Issue**: Shows "#12" but actual player could be different index if fewer players exist.
- **Fix**: Use mid_player name from API data.

### QA-5: Tier descriptions not rendered (MEDIUM)
- **File**: frontend/tiers.html
- **Issue**: CSS for .tl-tier-desc defined but tier label text never shown. Users don't know what S/A/B mean.
- **Fix**: Render tier.label text in the tier label section.

### QA-6: Catch-all archetype labels misleading (MEDIUM)
- **File**: backend/live_data.py lines 9145, 9158, 9169, 9182
- **Issue**: "Blocking TE", "Committee Back" etc. catch all unclassified players. A decent TE2 labeled "Blocking TE" is misleading.
- **Fix**: Rename catch-alls to "Other RB", "Other WR", "Other TE", "Backup QB".

### QA-7: Form control borders 2px not 3px (LOW)
- **Files**: auction.html, tiers.html, archetypes.html — select/input borders
- **Issue**: 2px borders instead of 3px design standard.
- **Fix**: Update to 3px.

### QA-8: Position tab box-shadow 2px not 4px (LOW)
- **Files**: auction.html, tiers.html, archetypes.html — pos tab buttons
- **Issue**: 2px 2px 0 instead of design guide 4px 4px 0.
- **Fix**: Accept for small elements — intentional for pills/tabs.

---

## UX FINDINGS

### UX-1: No aria-labels on position tab buttons (LOW)
- **Issue**: "QB", "RB" etc. are terse for screen readers.
- **Fix**: Low priority — log for accessibility pass.

---

**Summary**: 2 HIGH, 4 MEDIUM, 2 LOW. No CRITICALs.
