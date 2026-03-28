# S2-059: signOut() leaves 33 localStorage keys — data leak on shared devices

**Severity**: S2 (Medium)
**Category**: Security / Privacy
**Source**: EDGE-CASES.md #28

## Problem

`signOut()` at `frontend/app.js:1086-1107` removes 19 localStorage keys but leaves 33 user-specific keys behind. On shared computers, the next user inherits the previous user's:

- **Warroom AI chat history** (`razzle_warroom_memory`) — most sensitive, contains full conversation with AI agents
- **Saved Lab views** (`razzle_saved_views`) — reveals analysis patterns
- **Pinned players** (`razzle_pinned_players`, `razzle_pinned_cache`)
- **Custom roster** (`razzle_my_roster`)
- **Panel visit history** (`razzle_panel_visits`, `razzle_recent_panels`, `razzle_favorite_panels`)
- **League selection** (`razzle_selected_league`)
- **UI preferences** (density, heat colors, page size, etc.)

## Root Cause

`signOut()` was written to clear auth + formula store data only. Lab and Warroom maintain independent localStorage caches never connected to the signOut flow.

## Keys NOT cleared (33 total)

### High sensitivity (user-specific data):
- `razzle_warroom_memory` — set in `warroom.js:3360`
- `razzle_saved_views` — set in `lab.js`
- `razzle_pinned_players` / `razzle_pinned_cache` — set in `lab.js`
- `razzle_my_roster` — set in `lab.js`
- `razzle_selected_league` — set in `league-intel.html`
- `razzle_waitlist` — set in `league-intel.html`

### Medium sensitivity (usage patterns):
- `razzle_last_panel`, `razzle_panel_visits`, `razzle_recent_panels`, `razzle_favorite_panels` — set in `lab.html`
- `razzle_cat_collapsed` — set in `lab.html`
- `razzle_lab_context`, `razzle_lab_visited` — set in `lab.js`

### Low sensitivity (UI preferences):
- `razzle_col_widths`, `razzle_shortcuts_shown`, `razzle_custom_scoring`, `razzle_data_bars`, `razzle_density`, `razzle_group_headers`, `razzle_heat_colors`, `razzle_leader_badges`, `razzle_page_size`, `razzle_percentile_mode`, `razzle_summary_bar`, `razzle_tier_breaks`, `razzle_universe`, `razzle_college_view` — all set in `lab.js`
- `razzle_demo_dismissed`, `razzle_first_query_done`, `razzle_setup_dismissed` — set in `warroom.js`
- `razzle_weekly_briefing` — set in `agents.html`
- `razzle_lab_nudge_shown` — set in `lab.js`

## Fix

In `frontend/app.js:1086-1107`, add `localStorage.removeItem()` calls for all 33 missing keys. Alternatively, iterate all localStorage keys with prefix `razzle_` and remove them:

```javascript
// Nuclear option: clear all razzle_ keys
Object.keys(localStorage).forEach(function(k) {
  if (k.startsWith('razzle_')) localStorage.removeItem(k);
});
```

## Acceptance Criteria

1. After calling `signOut()`, zero `razzle_*` keys remain in localStorage
2. Warroom memory is fully cleared
3. Saved views and pinned players are cleared
4. UI preferences reset to defaults
