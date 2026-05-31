# Evidence — lab-og-from-panel-gate-c-rest

**Date:** 2026-05-31  
**Atom:** `lab-og-from-panel-gate-c-rest` — Gate C pytest + curl for prospects/tradevalues FROM PANEL snapshot  
**Trust:** T5, T6

## Build

```text
JWT_SECRET=ci-secret python3 -m pytest apps/api/tests/test_og_from_panel_sticker.py apps/api/tests/test_og_from_panel_gate_c_rest.py -q --noconftest
# 4 passed

npm run build --workspace=apps/web
# exit 0
```

## Gate C — snapshot OG PNG (FROM PANEL)

```bash
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1&snapshot=W3sibiI6IlRyYXZpcyBIdW50ZXIiLCJwIjoiV1IiLCJ0IjoiSkFYIiwicyI6OTQsInNsIjoiUlBTIn0seyJuIjoiQ2FtIFdhcmQiLCJwIjoiUUIiLCJ0IjoiVEVOIiwicyI6OTEsInNsIjoiUlBTIn1d'
# 200 53068

curl -s -o /tmp/og-tradevalues-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/tradevalues?download=1&snapshot=W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MTAyMDAsInNsIjoiVmFsdWUifSx7Im4iOiJCaWphbiBSb2JpbnNvbiIsInAiOiJSQiIsInQiOiJBVEwiLCJzIjo5ODAwLCJzbCI6IlZhbHVlIn1d'
# 200 54645
```

Both PNG 1200×630, ≥40KB. Snapshot path shows `FROM PANEL · your rows` sticker (route shipped prior atoms).

## Code

- `apps/api/tests/test_og_from_panel_sticker.py` — prospects + tradevalues in snapshot slug guard list.
- `apps/api/tests/test_og_from_panel_gate_c_rest.py` — LabOgExportLink codec fixtures + documented Gate C URLs.

## Verdict

**PASS** — pytest + web build green; prospects/tradevalues snapshot exports meet Gate C size floor.
