# Evidence — bureau-mc-preview-card

**Date:** 2026-05-31  
**Atom:** `bureau-mc-preview-card`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests/test_bureau_monte_carlo_share_bar.py -q   # 2 passed
curl -s -o /tmp/mc-preview.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/monte-carlo?league=demo&user=u1'
file /tmp/mc-preview.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| pytest share bar contract | 2 passed |
| Preview URL (no `download=1`) | `200 49181` PNG 1200×630 |
| Share bar | `preview card` opens `/og/monte-carlo?…` without download param |

## Change

`BureauMonteCarloShareBar` splits `previewParams` / `exportParams` and adds **preview card** link mirroring `BureauH2HShareBar` and `BriefingShareBar`.
