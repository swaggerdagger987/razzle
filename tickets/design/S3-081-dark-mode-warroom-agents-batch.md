---
id: S3-081
severity: S3
confidence: MEDIUM
category: dark-mode
source: DQ-277+278+279+328+323+336+346
status: OPEN
---

# Dark mode gaps — warroom, agents, and league-intel page-specific issues

## Root Cause

Beyond the global dark mode gaps (S2-092, S2-095), these pages have specific dark mode issues:

1. **League-intel zero page dark mode CSS** — `frontend/league-intel.html`: page-specific styles have no dark mode overrides despite complex custom UI (DQ-277)
2. **Agents HTML dark mode wrapper** — `frontend/agents.html`: the page is always-dark but uses a mix of hardcoded and variable colors; no consistent dark wrapper class (DQ-278)
3. **Agents feature table header** — `frontend/agents.html`: table headers don't flip properly in dark mode (DQ-279)
4. **Situation Room nav stays light** — `frontend/agents.html`: nav bar at top of Situation Room page uses light theme while content is dark (DQ-328)
5. **Warroom state colors fallback #666** — `frontend/warroom.js`: agent state dots use cold gray `#666` fallback instead of warm palette color (DQ-323)
6. **Agents mascot shadow rgba black** — `frontend/agents.html`: mascot drop-shadow uses `rgba(0,0,0,...)` instead of espresso (DQ-336)
7. **Garbage time card header misuse** — `frontend/garbagetime.html`: semantic colors (green/red) used on card headers don't adapt to dark mode (DQ-346)

## Fix

Add page-specific `[data-theme="dark"]` overrides for each page's custom elements. Replace cold grays with warm palette colors.

## Files

- `frontend/league-intel.html` — dark mode CSS
- `frontend/agents.html` — dark wrapper, table, nav, mascot shadow
- `frontend/warroom.js` — state color fallback
- `frontend/garbagetime.html` — semantic colors

## Acceptance Criteria

- All page-specific elements readable in dark mode
- No cold gray or black shadows in warm-palette contexts
- Situation Room page consistently dark-themed
