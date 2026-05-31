# Evidence — lab-breakouts-og-snapshot (2026-05-31)

## Slice

Breakouts Lab panel passes `snapshotRows` to `LabOgExportLink` so OG card matches visible breakout leaders.

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q   # 52 passed (snapshot tests need terminal.db)
```

## OG curl (Gate C)

```bash
# snapshot payload mirrors encodeOgSnapshot compact rows
curl -s -o /tmp/og-breakouts.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/breakouts?download=1&snapshot=..."
```

| Check | Result |
|-------|--------|
| HTTP | 200 |
| PNG size | 49199 bytes (≥ 40KB) |
| Route | `/og/breakouts?snapshot=...` |

## Verdict

**PASS** — snapshot param renders full PNG with panel-matched rows.
