# Evidence — League L1 Monte Carlo Odds (Cycle 23)

**Pillar:** League  
**Layer:** L1  
**Slice:** Bureau Monte Carlo championship odds summary cards  
**Commit:** (filled after commit)

## API shape

```python
# monte_carlo_projections returns:
# odds[]: { roster_id, manager, championship_pct, roster_power }
# simulations: 2000
# projections[] unchanged from cycle 19
```

## Unit tests

```bash
pytest apps/api/tests/test_bureau_monte_carlo.py -q
# 5 passed
```

## UI

`/league/[id]/monte-carlo` — Octo header, sticker cards sorted by championship %, progress bars, player distribution table, Room ask link on leader.

## Hallway

- `toRoom({ agentId: "octo", question: "... championship odds ..." })`
- `agentForBureauSection("monte-carlo")` → Octo

**Verdict:** PASS
