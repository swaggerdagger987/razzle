# Evidence — lab-og-live-sticker-prospects-weekly

**Date:** 2026-05-31  
**Atom:** `lab-og-live-sticker-prospects-weekly`  
**Verdict:** PASS

## Build

```bash
npm run build --workspace=apps/web  # exit 0
```

## Gate C — OG PNG (localhost:3000)

```bash
curl -s -o /tmp/og-weekly.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/weekly?download=1'
# 200 66512

curl -s -o /tmp/og-prospects.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/prospects?download=1'
# 200 60688
```

## Product

- Weekly + Prospects Launch-10 OG cards show panel-specific LIVE stickers (`spike weeks`, `RPS board`) when API rows load; blurb suffix remains `· live nflverse rows`.
