# Evidence — Lab L5 career OG live extract

**Date:** 2026-05-31  
**Atom:** `lab-og-career-live-extract` — pro profile OG epic atom 2/4  
**Trust:** T5, T6

## Gate C — OG PNG

```bash
curl -s -o /tmp/og-career.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/career?download=1&player_id=00-0036900"
file /tmp/og-career.png
```

| Result | Value |
|--------|-------|
| HTTP | 200 |
| Size | 54171 bytes |
| Type | PNG 1200×630 |

## Tests

```bash
python3 -m pytest apps/api/tests/test_lab_og_career_live.py -q --noconftest
# 2 passed
npm run build --workspace=apps/web
# exit 0
```

**Verdict:** PASS — career OG uses `extractCareerRows` on `/api/career-stats` seasons payload; demo season arc + LIVE sticker when API empty.
