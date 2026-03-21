# FUNC-045: Watchlist Star Dead Click for Players with Apostrophes

**Severity**: P1
**Flow**: 10 (Pin player / Watchlist), 1 (Landing -> Lab)
**Found**: Session 44 (2026-03-21)
**Status**: OPEN
**Related**: FUNC-044 (same escapeAttr-in-onclick pattern)

## Description

The watchlist star (favorite toggle) on **every screener row** uses `escapeAttr(full_name)` inside an inline `onclick` handler. For the 11+ NFL players with apostrophes in their names, clicking the star is a dead click — silent JS SyntaxError, no visual feedback, player not added to watchlist.

This is the same root cause as FUNC-044 (aging curves + prospect profiles) but in the **most-used interactive element** on the site. Every single screener page load renders this broken onclick for apostrophe players.

## Affected Players (same as FUNC-044)

Ja'Marr Chase (#1 WR), D'Andre Swift, De'Von Achane, Aidan O'Connell, Ja'Lynn Polk, Ja'Tavion Sanders, Wan'Dale Robinson, D'Onta Foreman, D'Ernest Johnson, Lil'Jordan Humphrey, Jha'Quan Jackson

## Root Cause

**lab.js:1724-1729**:
```javascript
const pName = escapeAttr(player.full_name || player.player_name || "");
// ...
html += `<td class="col-star" ... onclick="toggleWatchlistPlayer('${escapeAttr(playKey)}', '${pName}', '${escapeAttr(pos)}', '${pTeam}', '${state.universe}')" ...>`;
```

After `escapeAttr`: `onclick="toggleWatchlistPlayer('00-0036900', 'Ja&#39;Marr Chase', 'WR', 'CIN', 'nfl')"`
After browser HTML entity decode: `onclick="toggleWatchlistPlayer('00-0036900', 'Ja'Marr Chase', 'WR', 'CIN', 'nfl')"`
Result: `SyntaxError: Unexpected identifier 'Marr'` — star click does nothing.

## Fix

Replace inline onclick with data attributes + addEventListener. The star cell needs all 5 params moved to data attributes:

```javascript
html += `<td class="col-star" data-pid="${escapeAttr(playKey)}" data-pname="${escapeAttr(player.full_name || player.player_name || '')}" data-pos="${escapeAttr(pos)}" data-team="${escapeAttr(player.team || player.school || '')}" data-universe="${escapeAttr(state.universe)}" style="text-align:center; padding:7px 4px; cursor:pointer; font-size:16px;" title="${starred ? 'Remove from watchlist' : 'Add to watchlist'}">${starred ? '<span style="color:var(--orange);">&#9733;</span>' : '<span style="color:var(--ink-faint);">&#9734;</span>'}</td>`;
```

Then after the table is rendered, attach listeners:
```javascript
document.querySelectorAll('.col-star[data-pid]').forEach(td => {
  td.addEventListener('click', () => {
    toggleWatchlistPlayer(td.dataset.pid, td.dataset.pname, td.dataset.pos, td.dataset.team, td.dataset.universe);
  });
});
```

**Important**: This should be done as part of the FUNC-044 fix batch. All three locations (watchlist star, aging curves, prospect profiles) should use the same data-attribute + addEventListener pattern.

## Verification

1. Load the screener, navigate to a page showing Ja'Marr Chase
2. Click the watchlist star — should toggle the star to gold
3. No JS errors in console
4. Verify the watchlist panel shows the player
5. Repeat for D'Andre Swift and Aidan O'Connell
