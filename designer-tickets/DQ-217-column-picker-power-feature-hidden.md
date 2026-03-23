# DQ-217: Column picker — 100+ stat columns hidden in collapsed sidebar

**Priority**: P2
**Category**: UX / Feature discoverability
**Page**: lab.html

## What's wrong

"100+ stat columns" is the headline feature (hero text, pricing page, meta description). But in the Lab, the column picker is:
1. Buried in the left sidebar under collapsed category headers
2. No visual hint on the table itself that columns are customizable
3. No "add column" button or CTA visible near the table headers
4. New users likely never discover they can add rushing, receiving, dynasty value, or college columns

The most marketed feature is the hardest to find.

## Fix

Add a subtle discoverability hint:
- A small "+" button or "Add columns" chip at the end of the header row
- Or a Caveat annotation on first visit: "psst — there are 100+ columns in the sidebar"
- Or auto-expand the column picker sidebar section on first visit

## Why it matters

If a Reddit power user visits and only sees the default columns, they'll think it's "just another screener." The custom columns (dynasty value, snap%, target share, college stats) are what make it screenshotable. Discovery gap = missed conversion.

## Not a dupe of

- DQ-116 (lab sidebar screener listed twice) — that's about duplicate nav entries
- DQ-113 (keyboard shortcut onboarding toast) — that's about shortcuts, not column discovery
