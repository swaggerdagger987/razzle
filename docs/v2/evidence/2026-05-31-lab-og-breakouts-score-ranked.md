# Evidence — lab-og-breakouts-score-ranked (cycle 94)

**Atom:** Breakouts OG export ranks top-6 by RBS/breakout score with position filter.

## Changes

- `BreakoutsRenderer.tsx` — `ogSnapshotRows` sorted desc by `rbs_score` / formula score before slice.
- `apps/web/app/og/[panel]/route.tsx` — direct `/og/breakouts|weekly|prospects` links sort rows by stat when not using snapshot param.

## Dedup

- `lab-og-weekly-ppg-ranked` already on `origin/razzle-v2-redesign` (`WeeklyHeatmapRenderer` PPG sort + position on export link); marked done without rebuild.

## Commands (executed)

```text
npm run build --workspace=apps/web  → exit 0
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?position=WR&download=1'
→ 200 61718
file /tmp/og-breakouts.png → PNG 1200x630
```

## Reality

PASS — Gate C PNG ≥40KB, ranked WR demo rows on share card.
