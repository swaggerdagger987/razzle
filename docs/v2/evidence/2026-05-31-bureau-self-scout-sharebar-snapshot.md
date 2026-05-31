# Evidence — Bureau Self-Scout ShareBar snapshot (2026-05-31)

**Atom:** `bureau-self-scout-sharebar-snapshot`  
**Epic:** League L5 — Bureau Self-Scout snapshot export (atom 1/3)

## Commands

```bash
python3 -m pytest apps/api/tests/test_bureau_self_scout_og_snapshot_codec.py -q
npm run build --workspace=apps/web
curl -s -o /tmp/og-scout-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/self-scout?download=1'
curl -s -o /tmp/og-scout-snap.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/self-scout?download=1&league=test&user=u1&snapshot=<canonical>'
file /tmp/og-scout-snap.png
```

## Results

| Route | HTTP | Bytes | Notes |
|-------|------|-------|-------|
| `/og/self-scout?download=1` | 200 | 66997 | Demo fallback PNG 1200×630 |
| `/og/self-scout?download=1&snapshot=…` | 200 | 67600 | Panel snapshot; label "from your scout" |

## Verdict

PASS — `BureauSelfScoutShareBar` encodes in-panel depth grades; OG route decodes shared lib so export cards match Bureau Self-Scout without live Sleeper on curl.
