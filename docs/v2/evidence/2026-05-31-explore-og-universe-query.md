# Evidence — Explore OG universe export URL (2026-05-31)

**Atom:** `explore-og-universe-query`  
**Files:** `ExploreShareButton.tsx`, `test_explore_share_og_universe.py`

## Acceptance

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_explore_share_og_universe.py -q` | 2 passed |
| `npm run build --workspace=apps/web` | exit 0 |

## Contract

- Preview + export links include `universe`, `sort`, `dir` query params
- College universe uses download filename `razzle-college-screener.png`
- NFL/default uses `razzle-explore.png`

## Verdict

**PASS** — Explore share toolbar passes universe into OG URLs for Reddit college vs NFL screenshots.
