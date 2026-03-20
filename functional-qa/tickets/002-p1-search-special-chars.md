---
id: FUNC-002
severity: P1
flow: 5 (Screener search), 67 (Special chars)
status: OPEN
file: backend/live_data/players.py
function: fetch_players, _fetch_screener_uncached
created: 2026-03-20
---

# P1: Search fails for players with hyphens and apostrophes

## What's broken

Searching for "Amon-Ra", "Ja'Marr", or "D'Andre" returns 0 results. These are common player names in the NFL.

## Root cause

The `search_name` column in the `players` table strips ALL special characters:
- `Amon-Ra St. Brown` → `amonrastbrown`
- `Ja'Marr Chase` → `jamarrchase`
- `D'Andre Swift` → `dandreswift`

But the search query only strips spaces, keeping hyphens and apostrophes:
```python
escaped_s = search.lower().replace(" ", "")
# "Amon-Ra" → "amon-ra" (hyphen preserved)
# Doesn't match "amonrastbrown" (hyphen stripped)
```

File: `backend/live_data/players.py`, lines ~131, ~255
Both `fetch_players` and `_fetch_screener_uncached` have the same bug.

## Fix

Strip all non-alphanumeric characters from the search input, matching the `search_name` normalization:

```python
import re
escaped_s = re.sub(r'[^a-z0-9]', '', search.lower())
```

Or equivalently:
```python
escaped_s = search.lower().replace(" ", "").replace("-", "").replace("'", "").replace(".", "")
```

## Affected players (partial list)

- Amon-Ra St. Brown (hyphen + period)
- Ja'Marr Chase (apostrophe)
- D'Andre Swift (apostrophe)
- D.J. Moore (periods)
- A.J. Brown (periods)
- De'Von Achane (apostrophe)
- Wan'Dale Robinson (apostrophe)
- D'Onta Foreman (apostrophe)
- Ka'imi Fairbairn (apostrophe)

## Workaround

Users can search without special chars: "AmonRa", "JaMarr", "DAndre" all work.
But no real user would think to do this.

## Verification

```bash
# Fails:
curl "https://razzle.lol/api/players?search=Amon-Ra&limit=3"  # 0 results
# Works:
curl "https://razzle.lol/api/players?search=AmonRa&limit=3"   # 1 result
```
