# DQ-089: Trade values page dumps 150 players with no tier breaks or visual sections

**Priority**: P2 — visual hierarchy / readability
**Category**: Layout / UX
**Files**: `frontend/tradevalues.html`

## Problem

The trade values page renders a 150-player bar chart as one continuous vertical list with no visual breaks. The page is extremely long (requires extensive scrolling) with no tier labels, section dividers, or grouping.

Compare to tiers.html which groups players into S/A/B/C/D/F tiers with color-coded section headers and clear dividers. Trade values has the SAME underlying data (composite trade value) but presents it as an undifferentiated wall of horizontal bars.

The page uses `limit=150` in its API call:
```javascript
var url = '/api/trade-value-chart?limit=150';
```

150 rows with no visual hierarchy is unreadable. Users can't quickly answer "where does my player fall?" without scanning the entire list.

## Fix

Add tier break dividers at natural value thresholds (matching the dynasty tier system from DESIGN.md):

1. Insert section headers at tier boundaries:
   - **Elite** (top ~10% by value)
   - **Blue Chip** (next ~15%)
   - **Starter** (next ~25%)
   - **Depth** (remainder)

2. Add a dashed divider between tiers:
```html
<div style="border-top: 2px dashed var(--ink-faint); margin: 16px 0; position: relative;">
  <span style="position:absolute; top:-10px; left:16px; background:var(--bg); padding:0 8px; font-family:var(--font-display); font-size:11px; text-transform:uppercase; color:var(--ink-light);">Starter Tier</span>
</div>
```

3. Alternatively, add a "jump to rank" control or position-grouped tabs to reduce scrolling.

## Why It Matters

Trade values is one of the most-visited standalone pages (dynasty players check this constantly). A 150-row undifferentiated list is the opposite of the "trust the user" principle — it makes them do all the work of finding their player. Tier breaks give instant context: "my guy is in the Starter tier."

## Verification

Open tradevalues.html. There should be visible section headers (Elite / Blue Chip / Starter / Depth) breaking the chart into scannable groups. Users should be able to identify tier boundaries at a glance.
