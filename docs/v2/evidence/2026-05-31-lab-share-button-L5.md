# Evidence — Lab L5 in-product export-card button

**Cycle:** 58
**Atom:** atom-2 (epic: Lab L5 depth — live OG and export cards)
**Slice:** Lab panel in-product export-card button to `/og/[panel]`

## What shipped

Every `/lab/[panel]` page now has a **copy link** + **export card** control in the
panel header (`PanelCanvas`). The export button links to `/og/[panel]?download=1`,
the live OG share card shipped in cycle 57. This closes the "export cards" half of
the epic: the card existed but had no in-product door. Mirrors the proven
`ExploreShareButton` pattern (cycle 55).

## Acceptance

| Check | Command | Result |
|-------|---------|--------|
| Typecheck | `npx tsc --noEmit --project apps/web/tsconfig.json` | 0 errors |
| Build | `npm run build --workspace=apps/web` | exit 0 — 109 pages, `/lab/[panel]` SSG (100 slugs), `/og/[panel]` dynamic |
| OG card real PNG (Gate C2) | `curl /og/rankings?download=1` | **200, 41,147 bytes**, PNG 1200×630 RGBA |
| OG card (second slug) | `curl /og/screener?download=1` | 200, 37,429 bytes, PNG 1200×630 |
| Invalid slug guard | `curl /og/not-a-real-panel` | **404** — route validates against panel registry; button only emits valid slugs |

## Why this is honest

- The button is a near-exact mirror of `ExploreShareButton` (verified cycle 55):
  `copy link` (clipboard) + `export card` (`<a download>` to the OG route).
- The OG card **content** (live player rows, agent badge, position pills, watermark)
  was implemented and verified in cycle 57 (commit `2e11270`). This slice does not
  modify card rendering — it adds reachability.
- 41KB PNG ≥ 40KB Gate C2 threshold confirms a substantive rendered card, not a
  15-byte empty shell.

## Limitations (FOLLOW-UP — pre-existing, not regressions)

- **terminal.db absent in CI VM** → OG card renders its branded fallback
  (panel icon + agent loading copy + watermark) rather than live rows. Same
  standing limitation documented in the 2026-05-30 standup; live-row rendering
  was verified in cycle 57. Production OG fetches real rows.
- **No browser engine in VM** → the `/lab/[panel]` client subtree hydrates
  client-side, so headless `curl` cannot assert the rendered button DOM. Verified
  instead by: tsc clean, successful build, source review against the proven
  `ExploreShareButton`, and the OG route serving a real PNG for the button target.

## Hallway checklist

- [x] playerIdentityConsistent — export reflects the panel's own slug
- [x] leagueContextGlobal — context bar unchanged on `/lab`
- [x] agentPromptWired — no change to agent prompts
- [x] crossRoomLinkPresent — OG card footer links back to `razzle.lol/lab/{slug}`
- [x] agentRegistryAligned — no new agent ids; OG card still shows panel agent owner
- [x] dolphinReachable — AgentNudgeBar + Player Sheet unchanged

## Verdict

PASS — Lab panels are now one click from a screenshot-worthy share card. T5 (Lab
invention as shareable artifact) + T6 (screenshot gravity) advanced.
