# Lab weekly OG snapshot verify — 2026-05-31

**Atom:** `lab-weekly-og-snapshot-verify`  
**Slice:** Weekly heatmap OG snapshot row parity audit (epic atom 3/3)

## Change

- Weekly OG demo fallback rows use **PPG** stat label (matches in-panel `WeeklyHeatmapRenderer` snapshot).
- Export card link shows whenever heatmap has players (not gated on `hotPlayer`).

## Commands (executed)

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-weekly-rb.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?position=RB&download=1'
# 200 44781

curl -s -o /tmp/og-weekly-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?position=WR&download=1&snapshot=eyJuIjoiQW1vbi1SYSBTdC4gQnJvd24iLCJwIjoiV1IiLCJ0IjoiREVUIiwicyI6MTguNCwic2wiOiJQUEcifSx7Im4iOiJUZWVrIEhpbGwiLCJwIjoiV1IiLCJ0IjoiTUlBIiwicyI6MTcuMiwic2wiOiJQUEcifV0'
# 200 53256

file /tmp/og-weekly-rb.png /tmp/og-weekly-snap.png
# PNG 1200x630 both
```

## Gate C

PASS — PNG ≥ 40KB with position=RB and snapshot+position=WR (PPG labels in snapshot path).
