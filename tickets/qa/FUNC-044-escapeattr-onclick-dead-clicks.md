# FUNC-044: escapeAttr-in-onclick Causes Dead Clicks for Players with Apostrophes

**Severity**: P1
**Flow**: 22 (Aging Curves), 45 (Big Board / Prospects)
**Found**: Session 43 (2026-03-21)
**Status**: OPEN

## Description

The Ship Loop commit c613fc6 correctly identified that `escapeAttr()` in inline onclick handlers is broken: browsers decode HTML entities (`&#39;` back to `'`) before executing JS in event handlers, causing syntax errors. The fix was applied to roster search (replaced with data-attributes + addEventListener) but left the same vulnerable pattern in at least 2 other locations where **player names** (not IDs) are used.

11 NFL players across all positions have apostrophes in their names. Their aging curves toggle buttons are dead clicks — clicking does nothing (JS SyntaxError).

## Affected Players

| Position | Players |
|----------|---------|
| QB | Aidan O'Connell |
| RB | De'Von Achane, D'Andre Swift, D'Onta Foreman, D'Ernest Johnson |
| WR | Ja'Marr Chase, Wan'Dale Robinson, Lil'Jordan Humphrey, Ja'Lynn Polk, Jha'Quan Jackson |
| TE | Ja'Tavion Sanders |

Ja'Marr Chase is the **#1 WR in fantasy football**. His aging curves button is broken.

## Root Cause

**lab.js:9687** (aging curves player toggle):
```javascript
html += '<button onclick="toggleACPlayer(\'' + escapeAttr(p.name) + '\')" style="...'
```

After `escapeAttr`: `onclick="toggleACPlayer('Ja&#39;Marr Chase')"`
After browser HTML entity decode: `onclick="toggleACPlayer('Ja'Marr Chase')"`
Result: `SyntaxError: Unexpected identifier 'Marr'` — button does nothing.

Same pattern at **lab.js:1765** (prospect profile links):
```javascript
html += `<a href="#" onclick="openProspectProfile('${pn}', ...)">`
```
Where `pn = escapeAttr(player.player_name)` — any prospect with an apostrophe gets a dead link.

## Fix

Apply the same pattern the Ship Loop used for roster search (c613fc6):

### lab.js:9687 — Aging curves
Replace inline onclick with data attribute + addEventListener:
```javascript
html += '<button class="ac-player-toggle" data-name="' + escapeAttr(p.name) + '" style="...'
// After innerHTML set:
container.querySelectorAll('.ac-player-toggle').forEach(btn => {
  btn.addEventListener('click', () => toggleACPlayer(btn.dataset.name));
});
```

### lab.js:1765 — Prospect profiles
Replace inline onclick with data attributes + addEventListener:
```javascript
html += `<a href="#" class="prospect-link" data-name="${escapeAttr(player.player_name)}" data-pos="${escapeAttr(pPos)}" data-year="${pYear}">${_highlightSearch(escapeHtml(player.player_name))}</a>`;
// After innerHTML set:
document.querySelectorAll('.prospect-link').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); openProspectProfile(a.dataset.name, a.dataset.pos, parseInt(a.dataset.year)); });
});
```

## Verification

1. Load aging curves panel, select WR position
2. Ja'Marr Chase toggle button should work (click toggles visibility)
3. No JS errors in console when clicking any player with apostrophe
4. Load prospects panel with a prospect whose name has an apostrophe — click opens profile
