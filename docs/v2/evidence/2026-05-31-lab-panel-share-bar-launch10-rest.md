# Evidence — Lab L5 Launch-10 GTM share bar rollout (2026-05-31)

**Slice:** `lab-panel-share-bar-launch10-rest`  
**Atom:** 4/4 — efficiency, aging, trade values, prospects, dashboard, dynasty comps

## Commands

```bash
python3 -m pytest apps/api/tests/test_lab_panel_share_bar.py -q --noconftest
# → 13 passed

npm run build --workspace=apps/web
# → exit 0

curl -s -o /tmp/og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/<slug>?download=1&force_demo=1"
```

## OG PNG sizes (force_demo=1)

| Slug | HTTP | Bytes |
|------|------|-------|
| efficiency | 200 | 64347 |
| aging | 200 | 64098 |
| tradevalues | 200 | 67267 |
| prospects | 200 | 63453 |
| dashboard | 200 | 66547 |
| dynasty-comps | 200 | 60779 |

All ≥ 40KB. PNG verified via `file`.

## Verdict

**Reality: PASS** — Launch-10 Lab renderers use `LabPanelShareBar` (copy/preview/export); OG cards remain screenshot-ready.
