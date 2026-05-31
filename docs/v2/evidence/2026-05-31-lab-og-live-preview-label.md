# Evidence — Lab OG live preview label

**Date:** 2026-05-31  
**Atom:** `lab-og-launch10-live-label`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Change

When `liveHasRows` on `/og/[panel]`, blurb suffix is `· live preview` (not `· live data` or `· sample preview`).

## Command

```bash
curl -s -o /tmp/og-rankings.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/rankings?download=1'
```

Expect HTTP 200 and PNG ≥40KB.
