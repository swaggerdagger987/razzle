# Evidence — League L1 Monte Carlo (Cycle 19)

**Pillar:** League  
**Layer:** L1  
**Slice:** Bureau Monte Carlo real weekly distributions

## API shape

```python
# monte_carlo_projections(league_id, scoring)
# projections[].mean, floor, ceiling, stddev, games, name, manager
# players_with_stats > 0 when terminal.db has weekly logs
```

## Unit tests

```bash
pytest apps/api/tests/test_bureau_monte_carlo.py -q
# 3 passed
```

## UI

`/league/[id]/monte-carlo` — table with player, pos, mean, floor, ceiling (non-zero rows only)

**Verdict:** PASS (distributions real; championship sim grid deferred L2)
