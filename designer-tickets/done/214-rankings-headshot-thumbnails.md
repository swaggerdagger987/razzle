<!-- PM: ready -->
---
id: DES-346
priority: P2
area: rankings.html
section: player chips
type: visual / shareability
status: open
---

# Rankings page player chips are text-only — no headshot thumbnails for visual recognition

## What's wrong

The Dynasty Rankings Board (rankings.html) shows 80+ player chips arranged in a grid. Each chip contains only: position badge (colored circle) + player name (12px text). No headshot thumbnail.

For dynasty rankings — one of the most shared and screenshot-ed content types in fantasy football — visual recognition is critical. Users scan rankings boards looking for specific players. With text-only chips, you must read every name sequentially. A 20px headshot thumbnail per chip would make players instantly recognizable.

## Where

`frontend/rankings.html` — player chip rendering. Chips currently contain `.tl-chip-pos` (position badge) + `.tl-chip-name` (text).

Compare to the Lab screener (lab.html) and breakout cards (breakouts.html) which both include player headshots from the ESPN CDN.

## Evidence

Screenshot: rankings-desktop.png — a grid of 80+ small text chips. Without headshots, finding "Ja'Marr Chase" requires reading 20+ chips. With headshots, his face is recognizable in <1 second. The breakouts page (breakouts-close.png) uses full headshots and is instantly scannable.

## Suggested fix

1. Add a 20px circular headshot thumbnail to each chip, before the position badge
2. Headshot source: ESPN CDN pattern already used elsewhere (`https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/{espn_id}.png`)
3. Add loading="lazy" since there are 80+ chips
4. Fallback: position-colored circle with initials (same pattern as Lab screener)

## Why this matters

Dynasty rankings are screenshotted more than almost any other fantasy content. A text-only rankings board looks like a spreadsheet. A rankings board with headshots looks like a professional product. The headshot CDN pattern already exists in the codebase — this is reusing an existing asset, not building something new.
