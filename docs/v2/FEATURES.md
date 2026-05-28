# Feature Milestones — Not the finish line

> **Banner:** GREEN = the milestone shipped. **Real depth lives in `PARITY.md`.** Current build is ~15% of V1 depth; do not read this table as "done."

Status: `RED` | `YELLOW` | `GREEN`. The build chain (Strategist / Architect / Builder per `docs/company/MEETINGS.md`) picks one slice per cycle from `PARITY.md` rows or `DEPTH.md` layer climbs — not from this table.

| ID | Feature | Status | Done when |
|----|---------|--------|-----------|
| F-01 | Explore NFL screener | GREEN | Loads, sorts, filters, Player Sheet |
| F-02 | Explore **college** screener | GREEN | Universe toggle NFL/College; college rows from `cfb_player_season_stats` |
| F-03 | Explore prospects/combine | GREEN | Link to `/lab/prospects` from Explore NFL view |
| F-04 | Lab launch-10 panels | GREEN | 10 bespoke renderers + agent headers; generic table panels don't 500 |
| F-05 | Bureau + Sleeper | GREEN | Connect; 6 bespoke Bureau tabs (Self-Scout, Monte Carlo, Manager Profiles, Pressure Map, Trade Network, Trade Finder) |
| F-06 | **Pixel Situation Room** | YELLOW | Chat + briefing live; canvas hidden until 6 sprites ship |
| F-07 | Player Sheet (4 tabs) | GREEN | Stats + Ask live; League shows connected Sleeper context |
| F-08 | Agent context moat | GREEN | League + player in prompts |
| F-09 | Pro tier UX | GREEN | 402 gates + dev toggle |
| F-10 | Share / OG cards | GREEN | `/og/explore` watermarked card + copy link + export on Explore |
| F-11 | Data pipeline lean | GREEN | sync_data --quick ~15MB |
| F-12 | Code structure | GREEN | Routers thin, no god files, packages/ clear |
| F-13 | Billing wired (no keys) | GREEN | Checkout route exists; webhook logs only until SECRETS |
| F-14 | Mobile pass | GREEN | Explore card feed + Lab mobile drawer; fixed CSS |

Council picks **1–3 RED/YELLOW items per cycle** from PARITY.md first, then FEATURES.md.
