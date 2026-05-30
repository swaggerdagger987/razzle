# Evidence — Lab sidebar "By Staff" grouping (cycle 58)

**Slice:** Lab L2 — Lab sidebar groups panels by agent owner ("By Staff" view).
**Hallway:** H-04 (six agents same ids everywhere) — closes the `LabSidebar.tsx`
"group by agent" TODO in `docs/v2/AGENTS.md`.
**Files:** `apps/web/components/lab/LabSidebar.tsx`, `packages/ui/styles/lab.css`.

## Verdict: PASS

This is a sidebar navigation slice — **not** an OG/share-card path. FACTORY-DOD
Gate C (preview PNG) does not apply. Gates A (publish), B (merge), D (Slack
honesty) apply.

## Commands run this cycle

```
$ npx tsc --noEmit   (apps/web)
TSC_EXIT=0   # 0 errors

$ npm run build --workspace=apps/web
BUILD_EXIT=0
✓ Generating static pages (109/109)
/lab            171 B   117 kB   (○ Static)
/lab/[panel]  18.1 kB   157 kB   (● SSG, 100 panels)
```

```
$ git diff --stat
 apps/web/components/lab/LabSidebar.tsx | 171 +++++-----
 packages/ui/styles/lab.css             |  63 +++++
 2 files changed, 201 insertions(+), 33 deletions(-)
```

Within contract limits (≤2 files, ≤220 lines).

## What changed

- New `Category | Staff` segmented toggle at the top of the Lab sidebar.
- "Staff" mode groups panels under their analyst desk (avatar + name + role),
  ordered by the `@razzle/agents` roster: Razzle, Dr. Dolphin, Hawkeye, Bones,
  Octo, Atlas. Panels with no registered owner fall into a "More Panels" group.
- Desk headers are collapsible like category headers; per-item avatar is hidden
  under a desk header (redundant) and kept in Category mode.
- Source of truth is `agentForPanel()` — no agent metadata duplicated in the UI.

## Layer verification

Matches DEPTH.md Lab L2 ("agent-owned headers") and hallway H-04 — the named
analyst identity is now a first-class navigation axis, not just a per-row avatar.
T5 (Lab invention as staffed research) + T6 (a "Octo's desk" / "Hawkeye's desk"
screenshot is more shareable than an abstract category list).

## Follow-up debt

- A2: mirror the "By Staff" sections in the `/lab` index grid (`LabPanelGrid`).
- A3: per-desk intro copy in each analyst's voice.
