---
id: DQ-048
priority: P2
category: empty-state
page: league-intel.html
status: open
---

# Bureau pre-connect state — generic form with no feature preview

## What's wrong
Before connecting Sleeper, league-intel.html shows:
- Tiger mascot image
- "CONNECT YOUR SLEEPER" heading
- Username input + Connect button
- "Don't use Sleeper?" + "Verify me" buttons
- "See a demo league" button
- Footer

No preview of what you get after connecting. No screenshots of manager profiles, trade finder, pressure map. No value proposition. A visitor has no idea what connecting Sleeper unlocks and no motivation to share their username.

## Evidence
- Screenshot: league-intel.html shows clean but bare form with no feature teasers
- The Bureau has rich features behind the connection (manager profiles, trade finder, pressure map, activity feed) but none are previewed

## Fix
Below the connect form, add a "What you'll unlock" section:
1. 3-4 preview cards showing Bureau features (manager profiles, trade finder, pressure map)
2. Use blurred/dimmed static screenshots or placeholder illustrations
3. Brief description for each: "See who's panicking. Find trade partners. Know your rivals."
4. Keep the form prominent above this preview section

Goal: a visitor should WANT to connect before typing their username.

## Files
- `frontend/league-intel.html` — pre-connect state HTML (the form section visible before Sleeper connection)
