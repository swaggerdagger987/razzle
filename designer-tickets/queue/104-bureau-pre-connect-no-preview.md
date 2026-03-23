# DQ-104: Bureau pre-connect state has no visual preview

**Priority**: P2
**Category**: UX / Conversion
**Page**: league-intel.html
**Evidence**: bureau-light-desktop.png, bureau-dark-desktop.png

## Problem

The Bureau of Intelligence (league-intel.html) pre-connect state shows:

- "Connect your Sleeper" heading
- Sleeper username input + Connect button
- "Don't use Sleeper?" text
- "See a demo league" button

That's it. No preview of what connecting unlocks. No screenshots. No value proposition. A user who doesn't already know what Razzle does with their league data has no reason to type their username.

The connect form is well-styled and functions correctly. But it's a conversion dead end — there's no selling of the destination.

## Fix

Below the connect form, add a "Here's what you'll see" section with 3-4 feature previews:

1. Icon + "Roster analysis" — see your roster grade, positional strengths, and gaps
2. Icon + "Manager profiles" — behavioral tendencies, panic patterns, trade history
3. Icon + "Trade finder" — value-matched trade suggestions based on your league's rosters
4. Icon + "Pressure map" — who's desperate and who's comfortable

Use chunky bordered cards with position-colored icons. Style like the home page feature sections.

Optionally: a single blurred screenshot of a connected league view to show the "after" state.

## Verification

Navigate to league-intel.html without a connected league. Below the connect form, there should be compelling visual content showing what connecting unlocks.
