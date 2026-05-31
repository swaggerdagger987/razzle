# Next Company OS Slices

This file gives the first Slack-triggered cycles enough traction to avoid vague
slice selection.

The Product Strategist can override this file, but must explain why in the
standup.

---

## Current Lead Candidate

**Slice:** Lab L5 — OG export cards use live panel data rows, not placeholder
or weak generic screenshots.

**Why:** `docs/v2/STATUS.md` lists the current focus as Lab L5 and the next
slice as "Bureau H2H export or Lab panel OG live data rows." Cycle 56 fixed the
Satori display issue. The next compounding move is making the exported panel
cards feel like real research artifacts, not just a rendered shell.

**Product tie:** Lab panels need to become screenshot-worthy. Export cards are
how those screenshots travel.

**Depth tie:** `docs/v2/DEPTH.md` Lab L5 — OG card per panel matches
in-product export.

**Hallway tie:** The export should preserve player/panel context where
available, and the panel should remain connected to Player Sheet / Room through
existing hallway routes.

**Likely files:** Agent must inspect before editing.

- `apps/web/app/og/[panel]/route.tsx`
- `packages/panels/`
- `apps/web/app/lab/`
- any existing panel data helpers used by the OG route

**Evidence required:**

- Render at least one OG route successfully.
- If possible, compare one in-product panel row to the exported card's data.
- Reality Checker records screenshot/render evidence in the standup.

**Not this cycle:**

- Redesign all OG cards.
- Add new panels.
- Touch pricing/auth/billing.

---

## Backup Candidate

**Slice:** League L5 — Bureau H2H export.

**Why:** `docs/v2/PARITY.md` names Bureau H2H export as the next Explore-adjacent
or League-adjacent slice. This is valuable if Lab OG export is already complete
or blocked.

**Depth tie:** League L5 — Scenario explorer / what-if outputs that travel.

**Hallway tie:** Export should include league context and route back to Bureau /
Situation Room.

---

## If Both Are Blocked

Write a `KILL` standup explaining:

- which candidate was blocked
- what file/evidence proved it
- what input is missing
- which candidate should be tried tomorrow

Do not invent a third slice without citing `PARITY.md`, `DEPTH.md`, or
`ACCEPTANCE.md`.
