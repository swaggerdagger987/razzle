# FUNC-055: Standalone regression.html — 4 Field Mismatches, Page Always Empty

**Severity**: P1
**Flow**: TD Regression standalone page (flow 37)
**Found**: Session 50 (2026-03-21)
**Status**: OPEN
**Related**: FUNC-052 (same pattern in lab-panels.js, different wrong field names)

## Description

The standalone `regression.html` page uses completely different field names from what the `/api/td-regression` API returns. Before the Ship Loop's Session 32 null guard fix, this would crash with a TypeError on `.length` of undefined. After the fix, the null guards (`|| []`) silently return empty arrays, so the page always shows "no regression candidates found" — the bug is now hidden, not fixed.

### 4 Field Mismatches

| # | Frontend (regression.html) | API returns | Line | Impact |
|---|---|---|---|---|
| 1 | `data.regression_up` (line 527, 535, 538) | `data.positive_regression` | 527/535/538 | "Up" section always empty |
| 2 | `data.regression_down` (line 527, 543, 546) | `data.negative_regression` | 527/543/546 | "Down" section always empty |
| 3 | `data.pos_avg_rates` (line 489) | `data.pos_avg_td_rates` | 489 | Rate chips don't render |
| 4 | `p.regression_delta` (buildTable col, line 589) | `p.td_diff` | 589 | Delta column shows undefined |

### Why It's Always Empty Now

```javascript
// regression.html:527 (AFTER Ship Loop null guard fix)
if (!(data.regression_up || []).length && !(data.regression_down || []).length) {
    // data.regression_up is undefined → || [] → [].length === 0 → true
    // data.regression_down is undefined → || [] → [].length === 0 → true
    c.innerHTML = '<div class="reg-empty">no regression candidates found for this filter</div>';
    return;  // ← ALWAYS RETURNS HERE
}
```

Before the Ship Loop fix (line was `!data.regression_up.length`), this threw a TypeError, making the bug visible. The null guard silenced the crash but didn't fix the root cause.

### API Response

```json
{
    "positive_regression": [...],     // frontend reads: regression_up (undefined)
    "negative_regression": [...],     // frontend reads: regression_down (undefined)
    "pos_avg_td_rates": {"QB": 4.7},  // frontend reads: pos_avg_rates (undefined)
    "season": 2025
}

// Per-player record:
{
    "td_diff": 16.5,              // frontend reads: regression_delta (undefined)
    "actual_tds": 46.0,
    "expected_tds": 29.5,
    "td_rate": 7.3,
    "opportunities": 626
}
```

### Three Different Files, Three Different Wrong Names

This is a pattern — the API, standalone page, and lab panel all use different field names:

| Concept | API (backend) | regression.html | lab-panels.js (FUNC-052) |
|---|---|---|---|
| Buy list | `positive_regression` | `regression_up` | `buy_low` |
| Sell list | `negative_regression` | `regression_down` | `sell_high` |
| Rate map | `pos_avg_td_rates` | `pos_avg_rates` | `position_rates` |
| Per-player diff | `td_diff` | `regression_delta` | `diff` |

## Fix

```javascript
// regression.html:489
- renderRateChips(data.pos_avg_rates || {});
+ renderRateChips(data.pos_avg_td_rates || {});

// regression.html:527
- if (!(data.regression_up || []).length && !(data.regression_down || []).length) {
+ if (!(data.positive_regression || []).length && !(data.negative_regression || []).length) {

// regression.html:535
- if ((data.regression_up || []).length) {
+ if ((data.positive_regression || []).length) {

// regression.html:538
- html += buildTable(data.regression_up, 'up');
+ html += buildTable(data.positive_regression, 'up');

// regression.html:543
- if ((data.regression_down || []).length) {
+ if ((data.negative_regression || []).length) {

// regression.html:546
- html += buildTable(data.regression_down, 'down');
+ html += buildTable(data.negative_regression, 'down');

// regression.html:589 (buildTable column definition)
- { key: 'regression_delta', label: 'Delta', cls: 'center' },
+ { key: 'td_diff', label: 'Delta', cls: 'center' },
```

## Verification

1. Navigate to /regression.html
2. Page should show two sections: "Regression Up" and "Regression Down" with player data
3. Rate chips should appear at top showing per-position avg TD rates
4. Delta column should show actual numbers (not blank/undefined)
5. Compare data with /api/td-regression?season=2025 to verify match
