# DQ-215: Lab first-load shows empty table — new users see nothing

**Priority**: P1
**Category**: UX / First impression
**Page**: lab.html

## What's wrong

When a new user lands on lab.html for the first time, they see an empty screener table with "pulling film..." loading text. After the load completes, they see a table with data — but there's no visual preview, sample query, or onboarding hint that communicates "this is a 100+ column screener you can customize." The most powerful feature in the product looks like a basic data table on first impression.

## What should happen

The first-load experience should SHOW the tool's power immediately:
1. Pre-load a default query (e.g., top 50 players by PPG, 2025 season) so the table is never empty
2. Or show a skeleton preview with ghost rows that demonstrates the density of data available
3. A subtle Caveat annotation near the column headers: "100+ columns — customize in the sidebar"

## Why it matters

The North Star says the Lab should be "screenshotted on Reddit." A blank table on first load is not screenshotable. The hero feature needs to make an immediate visual impression.

## Not a dupe of

- DQ-076 (empty states generic) — that's about "no results found" messages after search, not the first-load experience
- DQ-086 (standalone pages no skeleton cards) — that's about standalone panel pages, not the Lab screener
