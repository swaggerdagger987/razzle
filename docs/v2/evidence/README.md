# Evidence — Cycle 56 Era Snapshots

Per-slice evidence files captured during the V2 redesign sweep. All files in
this folder are dated 2026-05-23 and document the localhost screenshot or curl
output that demonstrated a layer claim at that point in time.

## Naming convention

`YYYY-MM-DD-<pillar>-<layer>-<slice>.md`

Pillars: `explore` (Screener), `lab` (Panels), `league` (Bureau), `room`
(Situation Room), `hallway` (cross-pillar wires).

Layers: `L0` through `L5` per `docs/v2/DEPTH.md`.

## Where new evidence goes

Going forward, Company OS cycles capture evidence in two places:

- **Standup outputs** — `docs/company/standups/YYYY-MM-DD.md` (handoff + votes)
- **Slice evidence** — `docs/v2/evidence/YYYY-MM-DD-<pillar>-<layer>-<slice>.md`
  (curl output, screenshot, or executed test result, per Reality Checker
  contract in `docs/company/roles/reality-checker.md`)

Reality Checker PASS verdicts must point at one of these.
