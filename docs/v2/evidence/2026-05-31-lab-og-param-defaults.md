# Evidence — Lab L5 OG default player_id params

**Date:** 2026-05-31  
**Atom:** `lab-og-param-defaults`  
**Commit:** ef908a99

## Gate C — PNG curl

| Route | HTTP | Bytes | Verdict |
|-------|------|-------|---------|
| `/og/dynasty-comps?download=1` | 200 | 65961 | PASS — Match % comp rows, sample preview label |
| `/og/gamelog?download=1` | 200 | 58408 | PASS — FPTS demo rows with default player_id |

```bash
curl -s -o /tmp/og-dynasty-comps.png -w '%{http_code} %{size_download}' \
  'http://localhost:3000/og/dynasty-comps?download=1'
# 200 65961

file /tmp/og-dynasty-comps.png
# PNG image data, 1200 x 630
```

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Behavior

- `DEFAULT_OG_PLAYER_ID` (`00-0036900`) used when `player_id` / `id` query absent
- `{player_id}` path templates resolved for live fetch attempts
- `dynasty-comps` demo rows with Match % column when API unavailable
