# Evidence — Lab L5 career-compare OG live overlay

**Date:** 2026-05-31  
**Atom:** `lab-og-career-compare-live` — pro profile OG epic atom 3/4  
**Trust:** T5, T6

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-career-compare.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/career-compare?download=1&force_demo=1"
file /tmp/og-career-compare.png
```

| Result | Value |
|--------|-------|
| HTTP | 200 |
| Size | 52967 bytes (post-merge rebase verify) |
| Type | PNG 1200×630 |

## Tests

```bash
python3 -m pytest apps/api/tests/test_lab_og_career_compare_live.py -q --noconftest
# 2 passed
npm run build --workspace=apps/web
# exit 0
```

**Verdict:** PASS — career-compare OG fetches up to three `/api/career-stats` peaks via `p1`/`p2`/`p3`; demo overlay rows + LIVE sticker when API empty.
