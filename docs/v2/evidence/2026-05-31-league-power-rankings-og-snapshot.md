# Evidence — League power rankings OG snapshot

**Date:** 2026-05-31  
**Atom:** `league-power-rankings-og-snapshot`  
**Verdict:** PASS (FACTORY-DOD Gate C2)

## Commands

```bash
npm run build --workspace=apps/web  # exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  # 51 passed, 5 skipped
```

## OG curl

```bash
curl -s -o /tmp/og-power-demo.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1'
# → 200 68555

curl -s -o /tmp/og-power-snap.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/power-rankings?download=1&league=test-league&snapshot=<base64url>'
# → 200 50084 — blurb includes "from your board"
```

PNG 1200×630, ≥40KB — not loading-copy-only.

## Trust

T5 (export matches in-product board), T6 (Karpathy-simple snapshot param, mirrors H2H).
