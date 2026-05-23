# Evidence — League L1 Self-Scout (Cycle 20)

**Pillar:** League  
**Layer:** L1  
**Slice:** Bureau Self-Scout position depth grades UI

## API (unchanged — depth already returned)

```bash
# POST /api/bureau/self-scout { league_id, user_id }
# depth.QB/RB/WR/TE: { count, elite, depth[] }
```

## Unit tests

```bash
pytest apps/api/tests/test_bureau_self_scout.py -q
# 2 passed
```

## UI

`/league/[id]` — Hawkeye header, 4 position grade cards (A–F, score/100), top player click → Player Sheet, thin depth → Dolphin Room link, footer → roster-depth + Hawkeye Room ask

**Hallway:** `hallwaySlicePassed` all six checks documented in COUNCIL cycle 20

**Verdict:** PASS
