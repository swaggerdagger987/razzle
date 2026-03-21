# FUNC-052: TD Regression Lab Panel — 4 Field Mismatches, Panel Renders Empty

**Severity**: P1
**Flow**: TD Regression panel in Lab (flow 37)
**Found**: Session 48 (2026-03-21)
**Status**: OPEN
**Related**: None (standalone tdregression.html works correctly with matching field names)

## Description

The TD Regression panel in lab-panels.js uses completely different field names from what the `/api/td-regression` API returns. This causes the panel to render as **empty** — the user sees "no data" even though the API has valid regression data for 2025.

### 4 Field Mismatches

| # | Frontend (lab-panels.js) | API returns | Impact |
|---|---|---|---|
| 1 | `data.buy_low` (line 5213) | `data.positive_regression` | Buy Low section empty |
| 2 | `data.sell_high` (line 5214) | `data.negative_regression` | Sell High section empty |
| 3 | `data.position_rates` (line 5215) | `data.pos_avg_td_rates` | Rate chips don't render |
| 4 | `p.diff` (line 5222, 5259) | `p.td_diff` | Bar widths all zero |

### Why It's Completely Broken

```javascript
// lab-panels.js:5213-5215
var buyLow = data.buy_low || [];      // → [] (key doesn't exist)
var sellHigh = data.sell_high || [];    // → [] (key doesn't exist)
var rates = data.position_rates || {};  // → {} (key doesn't exist)

// line 5216
if (!buyLow.length && !sellHigh.length) {
    body.innerHTML = '<div class="lp-empty">' + razzleEmpty() + '</div>';
    return;  // → ALWAYS RETURNS HERE, panel shows empty state
}
```

### Standalone Page Works Correctly

The standalone `tdregression.html` (lines 273-275) uses the correct field names:
```javascript
var buyLow = data.positive_regression || [];   // ✓ correct
var sellHigh = data.negative_regression || []; // ✓ correct
var rates = data.pos_avg_td_rates || {};       // ✓ correct
```

And uses `p.td_diff` (line 291) instead of `p.diff`.

## API Response Verified

```json
{
    "positive_regression": [ ... ],    // frontend expects: buy_low
    "negative_regression": [ ... ],    // frontend expects: sell_high
    "pos_avg_td_rates": { "QB": 4.7, "RB": 3.2, ... },  // frontend expects: position_rates
    "season": 2025,
    "available_seasons": [2025, 2024, ...]
}

// Individual player record:
{
    "td_diff": 16.5,    // frontend expects: diff
    "actual_tds": 46.0,  // ✓ matches
    "expected_tds": 29.5, // ✓ matches
    "td_rate": 7.3,       // ✓ matches
    "opportunities": 626  // ✓ matches
}
```

## Root Cause

The lab-panels.js TD Regression panel was written with different field names than the backend API. The standalone HTML page was likely written at a different time and uses the correct names. When the panel was ported into the Lab sidebar, the field names were not updated to match the API.

## Fix

```javascript
// lab-panels.js:5213-5215
- var buyLow = data.buy_low || [];
+ var buyLow = data.positive_regression || [];
- var sellHigh = data.sell_high || [];
+ var sellHigh = data.negative_regression || [];
- var rates = data.position_rates || {};
+ var rates = data.pos_avg_td_rates || {};

// lab-panels.js:5222
- var allDiffs = buyLow.concat(sellHigh).map(function(p) { return Math.abs(p.diff || 0); });
+ var allDiffs = buyLow.concat(sellHigh).map(function(p) { return Math.abs(p.td_diff || 0); });

// lab-panels.js:5259
- var diff = p.diff || 0;
+ var diff = p.td_diff || 0;
```

## Verification

1. Open Lab → click "TD Regression" in sidebar
2. Panel should show two columns: "Buy Low (Positive Regression)" and "Sell High (Negative Regression)"
3. Each column should have players with actual/expected TDs, diff badges, and bar chart
4. Position rate chips should appear at top (QB avg TD rate: 4.7%, etc.)
5. Compare with standalone tdregression.html — data should match
