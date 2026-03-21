# FUNC-067: Awards runner-up PPG falsy-zero display bug

**Severity**: P2
**Flow**: 62 (Dashboard / Stat Leaders)
**File**: frontend/lab-panels.js
**Line**: 6894
**Status**: OPEN

## Description

In the Season Awards panel, the runner-up stat display uses `String(r.ppg || '')` which treats PPG=0 as falsy, showing an empty string instead of "0 PPG". The winner card on line 6858 correctly uses `String(w.ppg)` without the fallback.

## Code

```javascript
// Line 6894 — BUG: r.ppg of 0 shows empty string
html += '<span class="aw2-runner-stat">' + escapeHtml(isCollege ? String(r.ppg || '') + ' PPG' : (r.key_stat || '')) + '</span>';

// Line 6858 — CORRECT: winner uses String(w.ppg) directly
html += '<span>' + escapeHtml(String(w.ppg)) + ' PPG</span>';
```

## Fix

Change line 6894 to match the winner pattern:
```javascript
html += '<span class="aw2-runner-stat">' + escapeHtml(isCollege ? String(r.ppg != null ? r.ppg : '') + ' PPG' : (r.key_stat || '')) + '</span>';
```

## Impact

Low practical impact — season award runners-up are unlikely to have PPG=0. But this is inconsistent with the winner rendering and with the falsy-zero sweep the Ship Loop just completed. Should be fixed for completeness.

## Found

Session 67, 2026-03-21. Codebase scan for remaining falsy-zero patterns after Ship Loop sweep.
