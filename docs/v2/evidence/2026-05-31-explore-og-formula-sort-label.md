# Evidence — explore-og-formula-sort-label

**Date:** 2026-05-31  
**Atom:** `explore-og-formula-sort-label`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/explore-og-formula.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&force_demo=1&universe=nfl&sort=formula_dynasty_pulse&api_sort=fantasy_points_ppr&dir=desc&pos=QB'
file /tmp/explore-og-formula.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| Formula OG + force_demo | `200 73889` PNG 1200×630 |
| Card | FORMULA SORT badge; column header `dynasty pulse`; subtitle notes formula + FPTS row rank |

## Change

`ExploreShareButton` passes URL `sort` plus `api_sort` when formula view differs from screener fetch. `/og/explore` labels formula sorts honestly while fetching via `api_sort`.
