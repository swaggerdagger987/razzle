# Evidence — Lab L5 OG launch-10 snapshot export labels

**Date:** 2026-05-31  
**Atom:** `lab-og-launch10-live-label`  
**Verdict:** PASS

## Acceptance commands

```text
npm run typecheck --workspace=apps/web — exit 0
npm run build --workspace=apps/web — exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q — 51 passed, 5 skipped
```

## Gate C — snapshot export (no sample preview)

When Lab panels pass `snapshotRows`, OG blurb shows `· from your panel` instead of `· sample preview`.

```bash
# breakouts snapshot
curl -s -o /tmp/og-breakouts-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/breakouts?download=1&snapshot=W3sibiI6ICJSb21lIE9kdW56ZSIsICJwIjogIldSIiwgInQiOiAiQ0hJIiwgInMiOiA5MiwgInNsIjogIlNjb3JlIn0sIHsibiI6ICJMYWRkIE1jQ29ua2V5IiwgInAiOiAiV1IiLCAidCI6ICJMQUMiLCAicyI6IDg4LCAic2wiOiAiU2NvcmUifV0'
# 200 40811 PNG

# tradevalues snapshot
curl -s -o /tmp/og-tradevalues-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/tradevalues?download=1&snapshot=...'
# 200 41253 PNG

# weekly snapshot
curl -s -o /tmp/og-weekly-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?download=1&snapshot=...'
# 200 43899 PNG
```

## Gate C verdict

PASS — breakouts, tradevalues, weekly export links now pass in-panel top-6 rows via `LabOgExportLink.snapshotRows`; PNGs ≥40KB with player row layout.
