# League Roster Depth share OG — 2026-05-31

**Atom:** `league-roster-depth-share-og`  
**Slice:** Roster Depth copy link + OG export card (epic atom 2/3)

## Change

- `BureauRosterDepthShareBar` — copy depth link + export card (league + user params).
- `/og/roster-depth` — Hawkeye-branded OG card with per-position grades and top player demo rows.

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 51 passed, 5 skipped
curl -s -o /tmp/og-roster-depth.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/roster-depth?league=demo&user=demo-user&download=1'
# 200 54072

file /tmp/og-roster-depth.png
# PNG 1200x630
```

## Gate C

PASS — PNG 54072B ≥ 40KB with demo fallback rows showing position grades + top names.
