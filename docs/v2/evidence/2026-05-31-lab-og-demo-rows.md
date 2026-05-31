# Evidence — Lab L5 OG demo rows (2026-05-31)

## Slice

Lab `/og/[panel]` static demo player rows when live API fetch returns empty.

## Gate C — PNG checks

```text
curl -s -o /tmp/og-rankings.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/rankings?download=1"
# 200 59509

curl -s -o /tmp/og-breakouts.png -w "%{http_code} %{size_download}\n" \
  "http://localhost:3000/og/breakouts?download=1"
# 200 60649

file /tmp/og-rankings.png /tmp/og-breakouts.png
# PNG image data, 1200 x 630
```

## Verdict

PASS — HTTP 200, PNG ≥40KB, player row layout (demo) with "sample preview" subtitle.
