<!-- PM: ready -->
---
id: DES-349
priority: P3
area: sitewide footer
section: navigation
type: ux / navigation
status: open
---

# Footer "Teams" link hardcodes /team/KC — arbitrary team choice

## What's wrong

The footer "Tools" section includes a "Teams" link that goes to `/team/KC` (Kansas City Chiefs). This is an arbitrary team choice. A user from any other city finds this odd — "why am I looking at the Chiefs?"

There's no team index page that lists all 32 teams. The footer link should either go to a teams index or be labeled more specifically.

## Where

- `frontend/index.html` line 908: `<a href="/team/KC" class="footer-link">Teams</a>`
- Same pattern likely in footer across all 75 pages

## Suggested fix

Option A: Create a simple /teams.html index page listing all 32 teams with links to /team/{abbr}
Option B: Change the footer link to `/lab.html?panel=teams` if a teams panel exists
Option C: Remove the "Teams" link from footer until a proper index exists

## Why this matters

Minor but noticeable. A user browsing the footer and clicking "Teams" expects to see all teams, not one specific team. It feels like a dev left their favorite team hardcoded.
