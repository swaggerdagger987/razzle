# Lab OG career-compare live overlay — 2026-05-31 (dedup)

## Atom

`lab-og-career-compare-live` — already merged on `razzle-v2-redesign` at `9d19930cf`.

## Verification (this cycle)

```bash
git merge-base --is-ancestor 9d19930cf origin/razzle-v2-redesign && echo ON_BASE
python3 -m pytest apps/api/tests/test_lab_og_career_compare_live.py -q --noconftest
# 2 passed

curl -s -o /tmp/og-cc.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/career-compare?download=1&p1=00-0036900&p2=00-0036322&p3=00-0035640"
# 200 53068
```

## Gate C

PASS — base implementation; no duplicate route PR required.
