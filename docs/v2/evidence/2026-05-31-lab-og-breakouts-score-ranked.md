# Evidence — Lab L5 Breakouts OG RBS-ranked snapshot

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-score-ranked`  
**Verdict:** PASS

## Commands

```text
npm run build --workspace=apps/web → exit 0
curl -s -o /tmp/breakouts-og.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1&position=WR'
→ 200 61718
file /tmp/breakouts-og.png → PNG 1200x630
```

## Change

- `BreakoutsRenderer` sorts candidates by `rbs_score` (or active formula score) before encoding `snapshotRows` for OG export.

## Layer

Lab L5 — OG snapshot row fidelity epic atom 3/3 (epic complete after merge).
