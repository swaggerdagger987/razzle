# Evidence — lab-panel-share-bar-breakouts-buysell

**Date:** 2026-05-31  
**Atom:** `lab-panel-share-bar-breakouts-buysell`  
**Routes:** `/og/breakouts`, `/og/buysell`, `/lab/breakouts`, `/lab/buysell`

## Gate C

| Check | Result |
|-------|--------|
| HTTP breakouts demo | 200 |
| PNG breakouts (force_demo) | 66253 bytes (≥40KB) |
| HTTP buysell demo | 200 |
| PNG buysell (force_demo) | 64866 bytes (≥40KB) |
| Format | PNG 1200×630 both |

```bash
curl -s -o /tmp/breakouts-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1&force_demo=1'
# 200 66253
curl -s -o /tmp/buysell-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/buysell?download=1&force_demo=1'
# 200 64866
```

## Product

- `BreakoutsRenderer` + `BuySellRenderer` footers: `LabPanelShareBar` with formula snapshot rows.
- Build fix: empty-state `DynastyRankingsRenderer` sample export uses share bar (prior slice regression).

## Tests

- `pytest apps/api/tests/test_lab_panel_share_bar.py` — 4 passed
- `npm run build --workspace=apps/web` — exit 0

**Reality:** PASS
