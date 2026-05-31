# Evidence — lab-og-breakouts-rbs-ranked

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`  
**Verdict:** PASS

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-breakouts.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1&position=WR'
file /tmp/og-breakouts.png
```

## Results

| Check | Result |
|-------|--------|
| Web build | exit 0 |
| OG breakouts WR | `200 61718` bytes PNG |

## Change

`PANEL_OG_STAT_KEY.breakouts=rbs_score` — OG share cards sort top-6 by RBS with position tab, matching `BreakoutsRenderer` default snapshot export.
