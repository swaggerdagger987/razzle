# Evidence — Lab prospects OG RPS + position (cycle 89)

**Route:** `/og/prospects?download=1&snapshot=<base64url>&position=WR` (position optional)

**Slice:** `lab-prospects-og-rps-position` — ProspectsRenderer uses RPS stat label and passes `position` to `LabOgExportLink`.

## Curl (fixture snapshot, RPS labels in payload)

```bash
curl -s -o /tmp/og-prospects-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1&snapshot=eyJuIjoiVHJhdmlzIEh1bnRlciIsInAiOiJXUiIsInQiOiJDT0xPIiwicyI6OTQuMCwic2wiOiJSUFMifSx7Im4iOiJDYW0gV2FyZCIsInAiOiJRQiIsInQiOiJURU4iLCJzIjo5MS4wLCJzbCI6IlJQUyJ9XQ'
```

## Result (executed 2026-05-31)

```
200 58084
file: PNG image data, 1200 x 630
```

## Verdict

- Gate C2: PASS — PNG 58084 bytes (≥40KB)
- Gate C3: PASS — fixture payload uses `sl:RPS` matching in-panel RPS header
