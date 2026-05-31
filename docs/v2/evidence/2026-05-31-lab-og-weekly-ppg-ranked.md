# Evidence — lab-og-weekly-ppg-ranked

**Date:** 2026-05-31  
**Atom:** Live `/og/weekly` PPG leaders (complements hot-week snapshot on base).

```bash
npm run build --workspace=apps/web  # exit 0
curl -s -o /tmp/og-weekly-wr.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/weekly?position=WR&download=1'
# 200 53256
```

**PASS**
