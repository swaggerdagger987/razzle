# Evidence — Lab L5 dynasty rankings OG snapshot rows

**Date:** 2026-05-31  
**Atom:** `lab-og-dynasty-rankings-snapshot-rows`  
**Verdict:** PASS

## Change

`DynastyRankingsRenderer` sorts top-6 by `dynasty_value` (or formula score), encodes **Rank** 1–6 on export snapshot, passes `position` filter to OG route.

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-rankings-live.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/rankings?download=1'
# 200 59509

curl -s -o /tmp/og-rankings-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/rankings?download=1&snapshot=<base64url top-6 Rank rows>'
# 200 58968 — blurb includes "from your panel"
```

## Gate C

| Check | Result |
|-------|--------|
| HTTP 200 | PASS |
| PNG ≥ 40KB | PASS (live 59509, snap 58968) |
| Snapshot rows | Rank 1–6 labels |
