# Evidence — explore-og-college-sort-export

**Cycle:** 126 | **Date:** 2026-05-31

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | exit 0 |
| `curl …/og/explore?download=1&universe=college&sort=total_yards&dir=desc` | 200, 37393 bytes |

**Change:** `ExplorePageClient` passes `apiSortKey` to `ExploreShareButton` (complements 7dbd4b11 season/team params).

**Verdict:** PASS
