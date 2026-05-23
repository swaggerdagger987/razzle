# Razzle V2 — Product Spec

## Mission

Help obsessed fantasy players explore players to their heart's content — then personalize every insight through Sleeper league context.

## Four surfaces + connective tissue

| Surface | Route | Standalone job | Player Sheet tab |
|---|---|---|---|
| Explore | `/explore` | Discovery — full screener | Stats |
| Lab | `/lab`, `/lab/[panel]` | Analysis — 100 panels | Panels |
| League | `/league`, `/league/[id]` | Personalization — Bureau | League |
| Room | `/room` | Decision — 3 agents | Ask |

**Player Sheet** is an overlay (not nav item) opened from any surface.

**Context Bar** upgrades the entire app after Sleeper connect (in-place, no redirect).

## Launch scope

- 100 Lab panels (packages/panels catalog)
- 8 Bureau features (Self-Scout default)
- 3 Situation Room agents (Razzle, Octo, Bones)
- Free + Pro + Elite pricing per NORTH_STAR (gates on Lab + Bureau deep + Room)

## Free vs Pro gates

| Free | Pro |
|---|---|
| Explore screener | All 100 Lab panels |
| 5 free panels (screener, weekly, prospects, dashboard, leaders) | Full Bureau deep-dive |
| Bureau odds summary cards | Situation Room |
| Sleeper connect | |

## Success criteria

1. Screenshot test on Explore + panel exports
2. 10-second Bureau: connect → Self-Scout specific insight
3. Player Sheet handoff from any surface without context loss
4. Mobile usable (bottom nav + sheets)
