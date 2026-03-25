<!-- PM: ready -->
---
id: DES-004
parent: 000-P0 (Bureau Epic)
priority: P0
area: league-intel.html
section: Rivals + Trades tabs
type: feature
status: open
---

# Bureau: Rivals tab (behavioral profiles) + Trades tab (finder + network)

**File**: `frontend/league-intel.html`

## Rivals tab

- 12 manager profile cards
- Behavioral archetype badges (Panic Seller, Hoarder, Trade Addict, etc.)
- Trade tendency: who they trade with, positions they target
- Atlas historical pattern annotations
- Pressure Map: desperation score 0-100 per manager

## Trades tab

- Trade Finder: value-matched suggestions between managers
- Trade Network: who trades with whom (table format)
- Bones verdict on each suggested trade
- Recent trade history (from demo data)

## Design

- Manager cards: position-colored top stripes, chunky borders
- Agent attribution: Atlas on Rivals, Bones + Octo on Trades
- Archetype badges: sticker style, slight rotation

## Accept when

- Rivals tab shows 12 manager cards with archetype badges + desperation scores
- Trades tab shows trade suggestions + trade history
- Agent attribution visible on both tabs

## Depends on

DES-002 (demo data + tab skeleton)
