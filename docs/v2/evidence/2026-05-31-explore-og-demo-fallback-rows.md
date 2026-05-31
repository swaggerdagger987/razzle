# Evidence — explore-og-demo-fallback-rows

**Date:** 2026-05-31  
**Atom:** `explore-og-demo-fallback-rows`  
**Verdict:** PASS (FACTORY-DOD Gate C)

## Commands

```bash
npm run build --workspace=apps/web
npm run start --workspace=apps/web -- -p 3000
curl -s -o /tmp/og-explore-demo.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/explore?download=1&preview=demo'
```

## Results

| Route | HTTP | Bytes | PNG |
|-------|------|-------|-----|
| `/og/explore?download=1&preview=demo` | 200 | 60867 | 1200×630 |

## Notes

- NFL + college demo row tables when API empty or `preview=demo`.
- Subtitle appends `· sample preview` on demo path.
- Explore L5 epic atom 1/3.
