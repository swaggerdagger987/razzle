# Evidence — Bureau H2H rivalry URL user+opponent (2026-05-31)

**Atom:** `bureau-h2h-rivalry-url-user-opponent`  
**Epic:** League L5 — Bureau H2H export deep-links (atom 1/3)

## Commands (executed)

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test .venv-v2/bin/pytest apps/api/tests -q  → 59 passed, 5 skipped
curl -s -o /tmp/h2h-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/head-to-head?download=1&league=demo&user=u1&opponent=u2'
→ 200 72158
file /tmp/h2h-og.png → PNG 1200×630
```

## Verdict

PASS — Gate C2/C3.
