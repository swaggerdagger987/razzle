# Razzle V2 — Information Architecture

## Routes

```
/                           Marketing (SSR)
/explore                    Screener standalone
/lab                        Panel index (100 panels)
/lab/[panel]                Panel standalone + sidebar
/league                     Sleeper connect
/league/[id]                Bureau hub → Self-Scout default
/league/[id]/[feature]      Bureau sub-feature
/room                       Situation Room standalone
/player/[slug]              Player Sheet deep link
/og/[panel]                 Share card renderer
```

## Navigation

**Desktop:** Top nav — Explore | Lab | League | Room + Context Bar

**Mobile:** Bottom nav — same four + Context Bar compact

**Player Sheet:** Overlay on all routes; `?player=` or `/player/[slug]` deep link

## URL state

- Explore: `?q=&pos=&sort=&dir=&season=` via nuqs
- Lab panel: `/lab/weekly?season=2024`
- Player sheet: `/player/bijan-robinson?tab=league&from=explore`

## Context persistence

- Client: `sessionStorage` for Sleeper user + selected league
- Server: `league_snapshots` SQLite table, TTL 300s, refresh on demand
