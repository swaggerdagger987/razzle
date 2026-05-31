# Evidence — League Roster Depth Tab (2026-05-31)

**Slice:** `league-roster-depth-tab` — Unhide Roster Depth tab with Dolphin renderer  
**Cycle:** 81  
**Verdict:** PASS

## Acceptance commands

### Web build

```
npm run build --workspace=apps/web
```

Exit 0. Route `/league/[id]/roster-depth` compiles; `roster-depth` removed from `HIDDEN_BUREAU_SLUGS`.

### API tests

```
JWT_SECRET=test python3 -m pytest apps/api/tests -q
```

```
51 passed, 5 skipped, 1 warning in 1.37s
```

## UI verification

- `BureauRosterDepth.tsx` — Dolphin header, A–F position grades, full player lists with dynasty values, starter badges, Player Sheet clicks, Dolphin/Hawkeye Room hallway links, self-scout footer.
- `bureau-features.ts` — `roster-depth` unhidden from nav + route gate.
- `BureauFeatureBody.tsx` — wired renderer.

No OG gate this atom (tab renderer only).

## Trust pillars

T2 (hallway links to Room + self-scout), T5 (Dolphin domain ownership), T6 (screenshot-ready position depth board).
