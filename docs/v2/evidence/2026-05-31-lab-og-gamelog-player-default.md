# Evidence — Lab Gamelog OG default player export (2026-05-31)

**Atom:** `lab-og-gamelog-player-default`  
**Epic:** Lab L5 — OG export paths before player context

## Acceptance

```text
npm run build --workspace=apps/web
→ exit 0

curl -s -o /tmp/og-gamelog.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/gamelog?download=1'
→ 200 60634
file /tmp/og-gamelog.png → PNG 1200×630
```

## Change

- `GamelogRenderer.tsx`: empty-state footer adds `LabOgExportLink` with `DEFAULT_LAB_OG_PLAYER_ID` and label "export sample card".

## Gate C

PASS — PNG ≥40KB with default player before search.

## Trust

T5 (export matches Lab), T6 (reuses existing default player constant).
