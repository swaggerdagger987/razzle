# Evidence — League roster depth OG share (2026-05-31)

**Atom:** `league-roster-depth-og-share`  
**Slice:** Roster Depth tab copy link + OG grade card

## Gate C

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0; route `/og/roster-depth` listed |
| `python3 -m pytest apps/api/tests -q` | 51 passed, 5 skipped |
| curl demo PNG | `200 57282` bytes |
| `file /tmp/og-roster-depth.png` | PNG 1200×630 |

```bash
curl -s -o /tmp/og-roster-depth.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/roster-depth?download=1'
```

## Files

- `apps/web/app/og/roster-depth/route.tsx` — Hawkeye position grade card + demo fallback
- `apps/web/components/league/BureauRosterDepthShareBar.tsx` — copy depth link + export
- `apps/web/components/league/BureauRosterDepth.tsx` — share bar wired when `user_id` present

**Verdict:** PASS — Bureau depth tab travels in league group chats (Gate C2 ≥40KB).
