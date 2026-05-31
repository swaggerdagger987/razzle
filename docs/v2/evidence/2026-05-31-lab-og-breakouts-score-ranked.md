# Evidence — Lab L5 breakouts OG score-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | PASS |
| `/og/breakouts?download=1` | 200, PNG ≥40KB |

**Change:** `ogSnapshotRows` sorts by RBS/formula score before top-6 slice.

**Verdict:** PASS
