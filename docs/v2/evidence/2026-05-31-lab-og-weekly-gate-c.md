# Evidence — Lab weekly OG Gate C (2026-05-31)

**Atom:** `lab-og-weekly-gate-c-evidence`  
**Epic:** Lab L5 — weekly/prospects OG live trust (atom 1/3)

## Fixture

`/og/weekly?download=1&position=WR`

## Acceptance

```text
python3 -m pytest apps/api/tests/test_lab_og_weekly_gate_c.py -q --noconftest
→ 6 passed

curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1&position=WR'
→ 200 63603 (PNG 1200×630)
```

## Change

- `test_lab_og_weekly_gate_c.py` — documents Gate C params; guards WR default, heatmap extract, LIVE sticker.

## Gate C

PASS — route contract + curl PNG ≥40KB (see Reality standup for executed sizes).

## Trust

T5 (screenshot-worthy Lab export), T6 (panel-native weekly heatmap rows).
