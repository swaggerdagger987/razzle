# Evidence — Bureau Self-Scout ShareBar (2026-05-31)

**Atom:** `bureau-self-scout-sharebar`  
**Epic:** League L5 — Bureau share bar parity (atom 1/3)

## Commands

```bash
npm run build --workspace=apps/web   # exit 0
curl -s -o /tmp/og-self-scout.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/self-scout?download=1'
# 200 66997
file /tmp/og-self-scout.png
# PNG 1200x630
```

## Verdict

PASS — Self-Scout uses `BureauSelfScoutShareBar`; OG export unchanged at ≥40KB.
