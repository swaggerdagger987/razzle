---
id: DQ-477
title: warroom.js canvas draws 5 cold-black rgba(0,0,0) overlays outside DES-308 scope
priority: P2
category: color-warmth
status: open
cycle: 60
---

## Problem

DES-308 covers 8 cold-black `rgba(0,0,0,...)` instances in agents.html CSS, lab.html CSS, player.js, and lab-panels.js. This ticket covers 5 ADDITIONAL instances in `warroom.js` canvas-drawing code that DES-308 did not include (different file, different rendering context).

These canvas-drawn overlays use cold black as the base color instead of warm espresso, creating subtle cold undertones in the otherwise warm Situation Room.

## Evidence

`frontend/warroom.js`:

| Line | Code | Context |
|------|------|---------|
| 82 | `nameTag: 'rgba(0,0,0,0.7)'` | Agent name tag background (palette constant) |
| 299 | `px(tx, ty, TILE, 1, 'rgba(0,0,0,0.08)')` | Floor tile horizontal grout line |
| 300 | `px(tx + TILE - 1, ty, 1, TILE, 'rgba(0,0,0,0.06)')` | Floor tile vertical grain |
| 435 | `px(x + 4, y + 4, w - 4, h - 4, 'rgba(0,0,0,0.2)')` | TV window fill shadow |
| 1244 | `drawPixelRect(hudX, cy, tw, chipH, 'rgba(0,0,0,0.8)')` / `'rgba(0,0,0,0.5)'` | HUD agent chip background |

## Fix

Replace cold black base with warm espresso:
- `rgba(0,0,0,0.7)` -> `rgba(45,31,20,0.8)` (name tags)
- `rgba(0,0,0,0.08)` -> `rgba(45,31,20,0.1)` (floor grout)
- `rgba(0,0,0,0.06)` -> `rgba(45,31,20,0.08)` (floor grain)
- `rgba(0,0,0,0.2)` -> `rgba(45,31,20,0.25)` (TV shadow)
- `rgba(0,0,0,0.5/0.8)` -> `rgba(45,31,20,0.6/0.85)` (HUD chips)

## Files
- `frontend/warroom.js` lines 82, 299, 300, 435, 1244
