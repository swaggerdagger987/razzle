# Evidence — lab-og-player-scoped-export-default (cycle 130)

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `pytest apps/api/tests/test_lab_og_export_player_default.py -q` | 1 passed |

**Verdict:** PASS — export URL defaults `player_id` for all route player-scoped slugs.
