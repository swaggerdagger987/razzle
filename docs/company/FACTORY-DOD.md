# Factory Definition of Done

Every Company OS cycle is **incomplete** until all gates below pass. A standup
file and a local commit are **not** shipping. The Founder should never have to
discover unmerged branches, 404 previews, or empty OG cards.

**Reality Checker:** enforce this doc on every SHIP cycle.  
**Chief of Staff:** if any gate fails, verdict is NEEDS WORK or BLOCKED — not SHIP.

---

## Gate A — Publish (branch on GitHub)

After local commits:

1. Branch exists on `origin` (`git push` or Open Pull Request tool).
2. A PR is **open** with title `standup: YYYY-MM-DD` (or updated if one exists).
3. Slack summary includes **PR URL**. No URL = cycle incomplete.

If push and PR tools both fail → `BLOCKED: GITHUB_PUBLISH` and stop.

---

## Gate B — Merge (on `razzle-v2-redesign`)

When Reality PASS and CI jobs `api`, `web`, `web-build` are green:

1. Merge the PR via **ManagePullRequest** / Open Pull Request / `gh pr merge`.
2. Confirm: `gh pr view <n> --json state` → `"MERGED"`.
3. Confirm content commit is on base:

```bash
git fetch origin razzle-v2-redesign
git merge-base --is-ancestor <CONTENT_HASH> origin/razzle-v2-redesign \
  && echo "ON_BASE" || echo "NOT_ON_BASE"
```

4. Slack must say **`Merge: merged`**.  
   **`Merge: open checks pending`** is allowed only while CI is still running in
   the same session — before the VM closes, re-check and merge or report failure.

**Never** tag NEEDS FOUNDER because `gh` returned 403 on admin/read APIs.

---

## Gate C — Preview matches claim (UI / OG / export slices)

If the slice touched `apps/web/app/og/`, `ExploreShareButton`, Bureau export
links, or any share-card path:

### C1 — Route exists on merged base

After merge, the route must 404-check clean on a fresh checkout of
`origin/razzle-v2-redesign` (or verify in the same run after merge + fetch).

### C2 — PNG is real, not an empty shell

```bash
# Example — adjust path/params per slice
curl -s -o /tmp/og.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/rankings?download=1"
file /tmp/og.png   # expect PNG, size typically ≥ 40KB with live data
```

| Result | Verdict |
|--------|---------|
| 404 | NEEDS WORK — route not on base or wrong path |
| 200 but PNG < 15KB | NEEDS WORK — empty/stub card |
| 200, PNG ≥ 40KB, shows rows/cards | PASS candidate |

### C3 — No fake loading states as "done"

If live data requires query params (`league`, `user`, `opponent`, filters):

- **PASS** requires either:
  - curl/screenshot **with documented fixture params** showing real rows, **or**
  - a **static demo fallback** on the card (sample you/them rows, sample bars) —
    not agent `loadingCopy` alone ("pulling the archives…") with no data layout.

Follow-up debt for production-only Sleeper auth must be labeled **FOLLOW-UP** in
the standup, not hidden. Reality cannot PASS on loading-copy-only OG cards.

### C4 — Evidence file

Write `docs/v2/evidence/YYYY-MM-DD-<slice-slug>.md` with curl size, route, and
verdict. Mirror `docs/v2/evidence/2026-05-23-explore-L5.md`.

---

## Gate D — Slack honesty

The roll call must match git state:

| Claim | Required truth |
|-------|----------------|
| `Merge: merged` | Gate B passed |
| `Reality: PASS` | Gates C satisfied when UI/OG changed |
| `Content commit abc1234` | Real hash; on base if merged |
| "Build + tests pass" | Commands run this cycle, output in standup or evidence |

**False PASS** (build green but preview broken, branch not merged) is a Reality
Checker hard fail and Chief of Staff memory incident.

---

## End-of-cycle script (run before Slack)

```bash
CONTENT_HASH=<7-char hash>
git fetch origin razzle-v2-redesign
git merge-base --is-ancestor "$CONTENT_HASH" origin/razzle-v2-redesign \
  && MERGE_STATE=on_base || MERGE_STATE=not_on_base
gh pr list --head "$(git branch --show-current)" --json url,state
# If OG files changed in CONTENT_HASH..HEAD, run curl PNG checks (Gate C)
echo "MERGE_STATE=$MERGE_STATE"
```

If `MERGE_STATE=not_on_base` after you claimed merge → fix merge before Slack.

---

## What the factory fixes itself

| Failure | Owner | Same-cycle action |
|---------|-------|-------------------|
| Branch pushed, no PR | Builder + Chief | Open PR (ManagePullRequest) |
| PR open, CI green, not merged | Chief | Merge before closing VM |
| OG 404 on base | Builder | Fix route; new commit; re-run gates |
| OG empty / loading only | Builder + Reality | Static demo rows or fixture curl PASS |
| False PASS in standup | Reality | NEEDS WORK; block Slack "merged" claim |

The Founder reviews **direction** at night, not **pipeline hygiene**.
