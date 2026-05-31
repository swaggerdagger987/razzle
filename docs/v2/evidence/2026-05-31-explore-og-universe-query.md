# Evidence — explore-og-universe-query (2026-05-31)

**Atom:** `explore-og-universe-query`  
**Files:** `ExploreShareButton.tsx`, `test_explore_share_og_universe.py`

## Acceptance (this PR delta)

| Check | Result |
|-------|--------|
| `pytest apps/api/tests/test_explore_share_og_universe.py -q` | 2 passed |
| `npm run build --workspace=apps/web` | exit 0 |

## Contract

- Preview + export links include `universe`, `sort`, `dir` (base also forwards `season`/`team`)
- College universe uses download filename `razzle-college-screener.png`
- NFL/default uses `razzle-explore.png`

## Base (already on `razzle-v2-redesign`)

- `season`/`team` in OG URLs; college OG curl ~41KB with fixture params (cycle 7dbd4b11)

## Verdict

**PASS** — College vs NFL export filenames + pytest guard on top of universe/season OG parity.
