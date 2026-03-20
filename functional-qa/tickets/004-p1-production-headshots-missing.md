---
id: FUNC-004
severity: P1
flow: 13 (Player profile)
status: OPEN
file: data/terminal.db (production)
function: headshot_url column
created: 2026-03-20
---

# P1: All player headshots missing on production

## What's broken

Every player on production (razzle.lol) has `headshot_url = NULL`. This includes all top players: McCaffrey, Allen, Mahomes, Jefferson, Chase, Robinson, etc. Verified 20/20 top players have no headshot.

## Root cause

TICKETS.md shows "Repopulate player headshot URLs — DONE" locally, but the note says:
> "NOTE: After this fix, the user needs to manually upload the updated terminal.db to the Render persistent disk"

The local DB was synced with headshots but the production database on Render was never updated with the new data. The GitHub release data-v1 terminal.db doesn't include headshots.

## Impact

- Player profile pages show no player photo
- Hover cards and player comparison pages lack visual identification
- Makes the platform look incomplete/broken to new users
- Affects ALL players on production, not just some

## Fix

Human action required: Upload the locally-synced terminal_clean.db (with headshots populated) to the GitHub release, then trigger a Render redeploy so the fresh DB is downloaded.

## Verification

```bash
# On production — should return 0 (all null)
curl -s "https://razzle.lol/api/players?limit=5" | python -c "import json,sys; data=json.load(sys.stdin); items=data if isinstance(data,list) else data.get('items',[]); print(sum(1 for p in items if p.get('headshot_url')),'of',len(items),'have headshots')"
```
