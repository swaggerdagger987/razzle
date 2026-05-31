# Evidence — Lab L5 Gamelog OG peak-week FPTS sort

**Date:** 2026-05-31  
**Atom:** `lab-og-gamelog-weeks-fpts-sort`  
**Verdict:** PASS

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-gamelog.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?player_id=00-0036900&download=1'
file /tmp/og-gamelog.png
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| Size | 61129 bytes (≥40KB) — verified cycle 117 rebase on `78a792f3` |
| Format | PNG 1200×630 |

## Build / tests

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped

## Product note

Live `/og/gamelog` now ranks `weeks[]` by `fpts` desc with `Wk N` row labels — matches `GamelogRenderer` OG snapshot export.
