# Evidence — Lab L5 dynasty-comps OG live sticker

**Date:** 2026-05-31  
**Atom:** `lab-og-dynasty-comps-live-sticker`  
**Route:** `/og/dynasty-comps?download=1&player_id=00-0036900`

## Gate C

```text
curl -s -o /tmp/og-dynasty-comps.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/dynasty-comps?download=1&player_id=00-0036900"
200 54807
```

PNG ≥ 40KB with named comp/demo rows — PASS candidate.

## Tests

```text
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_dynasty_comps_live.py -q --noconftest
2 passed
npm run build --workspace=apps/web — exit 0
```

**Verdict:** PASS
