# Evidence — explore-og-universe-query

**Cycle:** 125 | **Date:** 2026-05-31

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `curl …/og/explore?download=1&universe=college&sort=total_yards&dir=desc` | 200, 37393 bytes |

**Change:** `ExplorePageClient` passes `apiSortKey` into `ExploreShareButton`.

**Verdict:** PASS
