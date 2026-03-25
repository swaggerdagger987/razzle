<!-- PM: ready -->
---
id: DES-005
parent: 000-P0 (Bureau Epic)
priority: P0
area: league-intel.html
section: Power Rankings + Schedule tabs
type: feature
status: open
---

# Bureau: Power Rankings tab + Schedule tab

**File**: `frontend/league-intel.html`

## Power Rankings tab

- Composite rankings beyond W-L (roster strength, depth, activity, schedule difficulty)
- Numbered rank cards for all 12 managers
- Octo agent attribution on methodology

## Schedule tab

- Remaining matchup difficulty per manager
- Easy/hard stretches highlighted (green/red)
- Playoff path preview
- Octo agent attribution on difficulty scoring

## Design

- Rank numbers in Luckiest Guy
- Difficulty badges: green (easy) to red (hard) scale
- Sand cards, chunky borders

## Accept when

- Power Rankings tab shows composite-ranked manager list
- Schedule tab shows difficulty grid with color coding
- Agent attribution visible on both tabs

## Depends on

DES-002 (demo data + tab skeleton)
