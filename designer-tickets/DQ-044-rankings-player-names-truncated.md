---
id: DQ-044
priority: P2
category: readability
page: rankings.html
status: open
---

# Rankings page — player names truncated in cards

## What's wrong
Player names in the rankings grid are truncated with ellipsis: "Ja'Marr C...", "Brock Bow...", "Malik Nab...", "Tee Higgi...". Player names are the single most important piece of information on a dynasty rankings card, and they're unreadable without hovering.

The cause: `.rankings-name` has `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` and the card grid uses `minmax(240px, 1fr)`. After rank number, headshot (36px), age badge, DVS score, and PPG, the name gets ~140-160px — not enough for names with apostrophes or longer last names.

## Evidence
- Screenshot: rankings.html closeup shows "Ja'Marr C..." truncated
- Code verified: rankings.html line 201-209, `.rankings-name` CSS with explicit truncation

## Fix
Option A (preferred): Increase minimum card width from 240px to 280px in the grid template. This gives names ~40px more room without breaking the layout.

Option B: Allow names to wrap to 2 lines. Remove `white-space: nowrap`, set `display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;` for controlled 2-line truncation.

Option C: Reduce font-size of DVS/PPG numbers from 14px to 12px to reclaim horizontal space for the name.

## Files
- `frontend/rankings.html` — `.rankings-card` grid template (line ~145), `.rankings-name` CSS (lines 201-209)
