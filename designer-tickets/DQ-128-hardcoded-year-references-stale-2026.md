# DQ-128: 3 hardcoded year references (2024/2025) going stale in 2026

**Priority**: P3 — LOW
**Category**: Content / Maintenance
**Scope**: 3 frontend JS files

## Problem

3 hardcoded year values in frontend JS will be stale or misleading now that the 2026 season is approaching:

1. **app.js** — `Math.min(new Date().getFullYear(), 2025)` — caps the year at 2025, preventing 2026 data from being referenced
2. **warroom.js** — `"Evaluating 2025 rookie draft class — who's the 1.01?"` — hardcoded 2025 in a demo scenario prompt
3. **league-intel.html** — `{name: "DynastyKing2024", record: "9-4", ...}` — hardcoded 2024 in demo data

## Fix

1. app.js: Remove the Math.min cap, or update to 2026
2. warroom.js: Replace with `new Date().getFullYear()` for dynamic year
3. league-intel.html: Update demo username or make year dynamic

All are one-line fixes. Low risk but affects perceived freshness of the product.
