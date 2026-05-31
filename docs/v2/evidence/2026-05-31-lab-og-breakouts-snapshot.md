# Evidence — Lab L5 breakouts OG snapshot (2026-05-31)

**Slice:** `lab-og-breakouts-snapshot` — Breakouts `LabOgExportLink` passes formula-sorted top-6 `snapshotRows`.

## Gate C — curl

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/breakouts?download=1` | 200 | 60649 | Demo fallback |
| `/og/breakouts?download=1&snapshot=…` | 200 | 44979 | Encoded RBS rows |

```bash
curl -s -o /tmp/og-breakouts-demo.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1'
# demo 200 60649

curl -s -o /tmp/og-breakouts-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1&snapshot=<encoded>'
# snap 200 44979
```

## Implementation

- `BreakoutsRenderer` — `ogSnapshotRows` from `candidates` (formula score or RBS); `position` on export link.

**Verdict:** PASS — PNGs ≥40KB; snapshot encodes visible top-6.
