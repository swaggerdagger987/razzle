# Evidence — Lab L1 breakouts (Cycle 10)

**Pillar:** Lab · **Layer:** L1 · **Slice:** `breakouts`

## Hallway checklist

| Check | Status | Evidence |
|-------|--------|----------|
| playerIdentityConsistent | ✅ | Row click → `openPlayer()` with `player_id`, slug from name |
| leagueContextGlobal | ✅ | Context bar unchanged on `/lab/breakouts` (global sleeper.ts) |
| agentPromptWired | ✅ | Footer `toRoom({ agentId: 'hawkeye', question: ... })` |
| crossRoomLinkPresent | ✅ | Player Sheet panels tab → `/lab/breakouts`; footer → `/room` |
| agentRegistryAligned | ✅ | `AGENT_BY_ID.hawkeye`, loading/empty copy from registry |
| dolphinReachable | N/A | Slice targets ages ≤27; injury not primary signal this panel |

## API

```bash
JWT_SECRET=test-secret DEV_PLAN=elite python -c "
from apps.api.services.panels.dispatcher import run_panel
r = run_panel('breakouts', {'limit': 3})
print(r['candidates'][0]['name'], r['candidates'][0]['rbs_score'])
"
# Cam Ward 64.0
```

## Routes

- `/lab/breakouts` — HTTP 200 (localhost smoke)
- Position filter: `?position=WR` via client fetch

## Verdict

**PASS** — screenshot-worthy RBS cards; CardsRenderer empty bug fixed via dedicated renderer.
