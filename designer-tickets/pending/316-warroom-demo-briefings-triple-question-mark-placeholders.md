---
id: DES-316
title: Warroom demo briefings show "???" placeholder text — looks like unfinished code
priority: P2
page: agents.html (warroom.js)
category: Content / Copy
cycle: 28
---

## Problem

The Situation Room demo briefings (warroom.js:3936-4005) show `???` as placeholder text in the "With league context" footnotes. Three instances:

1. Line 3957: `"whether ??? is available on your bench"`
2. Line 3970: `"would check if Daniels is on your roster or ???"`
3. Line 3970: `"surface waiver competition from ???"`

These `???` strings are visible to users in the demo briefing cards. They appear in the italicized context hints that explain what league-contextualized analysis adds. Instead of communicating "this is personalized," they read as unfinished developer placeholder text.

## Where

- `frontend/warroom.js` line 3957: Medical briefing context hint
- `frontend/warroom.js` line 3970: Scout briefing context hint (2 instances)

## Fix

Replace `???` with descriptive placeholder labels:
- `"whether ??? is available"` → `"whether [your backup QB] is available"`
- `"on your roster or ???"` → `"on your roster or available on waivers"`
- `"waiver competition from ???"` → `"waiver competition from rival managers"`

Or use a styled placeholder: `<em class="league-placeholder">[your league data]</em>`

## Evidence

- warroom.js:3957: `"whether ??? is available on your bench"` — visible to users
- warroom.js:3970: `"Daniels is on your roster or ???"` — visible to users
- These appear in demo cards that sell the premium Situation Room product
