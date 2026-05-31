# Evidence — lab-og-tolab-efficiency-position

**Date:** 2026-05-31  
**Atom:** `lab-og-tolab-efficiency-position` — efficiency RB in OG toLab watermark  
**Verdict:** PASS

## Commands

```bash
pytest apps/api/tests/test_lab_og_tolab_watermark.py -q --noconftest
# 7 passed

npm run build --workspace=apps/web
# exit 0

curl -s -o /tmp/og-efficiency.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/efficiency?download=1'
# 200 65774
file /tmp/og-efficiency.png
# PNG 1200x630
```

## Behavior

`TOLAB_DEFAULT_POSITION.efficiency = "RB"` mirrors `EfficiencyRenderer` default and
feeds both live API fetch and `watermarkPosition` so exports click back to
`razzle.lol/lab/efficiency?position=RB`.

## Trust

T5, T6
