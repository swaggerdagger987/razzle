# Evidence — Bureau Self-Scout snapshot roundtrip test (2026-05-31)

**Atom:** `bureau-self-scout-snapshot-roundtrip-test`  
**Epic:** League L5 — Self-Scout export travels with depth grades (atom 3/3)

## Commands

```bash
JWT_SECRET=test python3 -m pytest apps/api/tests/test_bureau_self_scout_og_snapshot_codec.py -q
# 4 passed
JWT_SECRET=test python3 -m pytest apps/api/tests -q --tb=no
# 59 passed, 5 skipped
```

## Verdict

PASS — pytest mirrors ShareBar tm/rc/pos compact codec; legacy `team` key fails decode.

## Trust

T5 (export fidelity), T6 (CI guardrail without web test runner).
