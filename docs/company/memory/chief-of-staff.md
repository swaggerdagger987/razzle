# Memory — Chief of Staff

Append-only log of coordination patterns, what worked, what didn't.

Format per entry:

```
YYYY-MM-DD | hypothesis | outcome | keep | discard | revisit | evidence
```

A good entry changes future behavior. A bad entry is a diary.

---

## Entries

2026-05-30 | NEXT.md eliminates slice selection ambiguity for morning standups | SHIP 3/3 on Lab L5 OG live data rows | keep | NEXT.md lead candidate matched PARITY/DEPTH/ACCEPTANCE; single-file touch kept scope tight
2026-05-31 | Cycle-1 VM can build+push but not merge: gh is read-only and no ManagePullRequest/merge tool was exposed; environment auto-opens PR after push | keep: post HONEST T2 (open PR / CI pending), never claim Merge:merged | discard: blocking on lock issue (gh read-only can't create company-os-lock; proceed if no competing run holds it) | revisit: confirm whether tick automations get a merge tool | evidence: pushed cursor/factory-workday-cycle-one-2495 (76dcc691 content, 79a2d079 standup); gh pr list empty post-push
2026-05-31 | When next_atom_id points to an already-covered atom, sharpen it to the real gap instead of rebuilding | keep | atom-2 "rankings/explore export rows" was done by generic /og/[panel] (c57) + Explore export (c55); real gap was Lab in-product reachability button — sharpened, shipped 2 files
