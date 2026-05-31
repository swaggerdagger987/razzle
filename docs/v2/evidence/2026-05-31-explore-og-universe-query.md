# Evidence — Explore OG college export filename (2026-05-31)

**Atom:** `explore-og-universe-query`  
**Cycle:** 129  
**Files:** `ExploreShareButton.tsx`, `test_explore_share_og_universe.py`

## Acceptance

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_explore_share_og_universe.py -q` | 2 passed |
| `npm run build --workspace=apps/web` | exit 0 |

## Contract

- Preview + export links include `universe`, `sort`, `dir` (plus `season`/`team` when set on base)
- College universe download filename: `razzle-college-screener.png`
- NFL/default download filename: `razzle-explore.png`

## Verdict

**PASS** — College explore exports save with a distinct filename on top of merged base season/team OG params.
