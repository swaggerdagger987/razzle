# Evidence — explore-og-universe-query (2026-05-31)

**Atom:** `explore-og-universe-query`  
**Epic:** Lab L5 — OG live fetch + sticker parity (atom 2/4)

## Change

- `ExploreShareButton` — `previewParams` / `ogParams` include `universe`; college exports download as `razzle-college-screener.png`.
- `test_explore_share_og_universe.py` — regression guard on toolbar OG URL contract.

## Commands

```bash
python3 -m pytest apps/api/tests/test_explore_share_og_universe.py -q
# 2 passed

npm run build --workspace=apps/web
# exit 0
```

## Verdict

**PASS** — Gate C N/A (no `/og/[panel]` change). Explore college export URL already carried `universe`; filename polish + pytest lock the contract.
