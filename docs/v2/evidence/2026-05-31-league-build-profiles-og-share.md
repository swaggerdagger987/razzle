# Evidence — League L5 Build Profiles OG export (2026-05-31)

## Slice

`league-build-profiles-og-share` — Atlas archetype card + share bar on Bureau Build Profiles.

## Commands (executed)

```bash
python3 -m pytest apps/api/tests -q
# 51 passed, 5 skipped

npm run build --workspace=apps/web
# exit 0; /og/build-profiles route listed

npx next start -p 3000  # apps/web
curl -s -o /tmp/og-build-profiles.png -w '%{http_code} %{size_download}\n' \
  'http://localhost:3000/og/build-profiles?league=demo&download=1'
# 200 73228
```

## Files

- `apps/web/app/og/build-profiles/route.tsx`
- `apps/web/components/league/BureauBuildProfilesShareBar.tsx`
- `apps/web/components/league/BureauBuildProfiles.tsx`

## Trust

T5 (export travels), T6 (voice — Atlas construction tape on card).
