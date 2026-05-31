# Evidence — lab-panel-share-bar-rankings

**Date:** 2026-05-31  
**Atom:** `lab-panel-share-bar-rankings`  
**Route:** `/og/rankings`, `/lab/rankings`

## Gate C

| Check | Result |
|-------|--------|
| HTTP demo | 200 |
| PNG size (force_demo) | 66806 bytes (≥40KB) |
| Format | PNG 1200×630 |

```bash
curl -s -o /tmp/rankings-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/rankings?download=1&force_demo=1'
# 200 66806
```

## Product

- `LabPanelShareBar`: copy panel link (`toLab`), preview card, export card with `encodeOgSnapshot`.
- `DynastyRankingsRenderer` footer uses share bar; snapshot rows follow formula sort when active.

## Tests

- `pytest apps/api/tests/test_lab_panel_share_bar.py` — 2 passed
- `npm run build --workspace=apps/web` — exit 0

**Reality:** PASS
