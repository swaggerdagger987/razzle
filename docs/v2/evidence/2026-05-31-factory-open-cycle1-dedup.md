# Evidence — 2026-05-31 factory open cycle 1 (dedup)

## Slice

Good morning 24be — verify `league-power-rankings-og` on base (parallel runs already shipped).

## Gate C

```text
curl -s -o /tmp/og-pr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1&league=test'
# 200 68874
file /tmp/og-pr.png
# PNG 1200x630
```

## Tests

- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
- `npm run build --workspace=apps/web` — exit 0

## Verdict

PASS — atom on base at e62721a6; PR #248 doc sync only.
