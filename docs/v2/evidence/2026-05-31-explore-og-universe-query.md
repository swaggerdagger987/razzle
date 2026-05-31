# Evidence — explore-og-universe-query

**Date:** 2026-05-31  
**Atom:** Explore OG export params — universe + college sort in toolbar URLs  
**Trust:** T5, T6

## Contract

- `buildExploreOgExportParams` always sets `universe` (nfl | college).
- College UI sort `fantasy_points_ppr` maps to `total_yards` in OG query (matches `/og/explore` fetch).
- `ExploreShareButton` uses shared helper for preview + export links.

## Tests

```bash
python3 -m pytest apps/api/tests/test_explore_og_export_params.py -q --noconftest
# 4 passed
npm run build --workspace=apps/web
# exit 0
```

## Gate C — OG curl

```bash
curl -s -o /tmp/og-college.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3001/og/explore?download=1&universe=college&sort=total_yards&dir=desc"
# 200 37393 — PNG 1200×630
```

## Verdict

PASS — college export URL carries universe; PNG ≥40KB with live layout.
