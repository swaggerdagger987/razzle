## Ticket: LAB-L2-STAFF-GROUPING (cycle 58)

- **Slice:** Lab L2 — "By Staff" grouping toggle in the Lab sidebar
- **Pillar / Layer:** Lab / L2 (agent-owned headers)
- **Citation:** `docs/v2/AGENTS.md` wiring checklist ("Lab sidebar — group by agent", was TODO), `docs/v2/DEPTH.md` Lab L2 ("agent-owned headers"), Hallway H-04 (six agents same ids everywhere)
- **Route:** `/lab` (sidebar present on `/lab` and `/lab/[panel]`)

### What changed

- `apps/web/components/lab/LabSidebar.tsx` — added a `By Category` / `By Staff`
  segmented toggle. In `By Staff` mode (no active search) panels group under each
  owning analyst, headed by avatar + name + role, ordered by the canonical six.
  Panels no specialist owns fall to a Razzle "Chief of Staff · the floor"
  general desk, kept last. Grouping uses `agentForPanel()` from `@razzle/agents`
  as the single source of truth — no metadata duplication.
- `packages/ui/styles/lab.css` — `.lab-sidebar-groupmode`, `.lab-groupmode-btn`,
  `.lab-sidebar-deskhead`, `.lab-deskhead-id`, `.lab-desk-role`. Mono font, 2px
  ink borders, terracotta (`--orange`) active state. DESIGN.md compliant.
- `docs/v2/AGENTS.md` — flipped the Lab sidebar wiring row from TODO to ✅.

### Evidence (executed)

```
$ npm run typecheck --workspace=apps/web   # tsc --noEmit
exit 0, 0 errors

$ npm run build                            # next build
exit 0 — 109 static pages generated; /lab (○ static) and /lab/[panel] (● SSG, 100 paths) build clean

$ npx eslint components/lab/LabSidebar.tsx
0 errors, 3 warnings (2 pre-existing <img> hints already on the sidebar; 1 pre-existing unused `grouped` in the separate LabPanelGrid)
```

Staff-desk population check (registry ownership vs the 100-panel catalog):

```
razzle  owns: dashboard
dolphin owns: workload
hawkeye owns: weekly, breakouts, prospects
bones   owns: tradevalues, trade-values, buysell
octo    owns: rankings, monte-carlo, efficiency, aging
atlas   owns: gamelog, dynasty-history
general/unowned: 86
```

All six staff desks render with ≥1 panel; the general desk catches the long tail.

### Limitation / follow-up debt (REFINE)

- Registry `labPanels` ownership is sparse (14 of 100 panels mapped), so the
  general desk is large. Deepening agent ownership in `packages/agents/registry.ts`
  is the natural next L2/L3 move — out of scope this cycle (would touch the
  registry source of truth).
- Visual screenshot deferred: capturing it requires a running dev server, which
  the morning automation avoids. tsc + build + eslint + ownership count are the
  execution evidence.

- **Verdict:** PASS
