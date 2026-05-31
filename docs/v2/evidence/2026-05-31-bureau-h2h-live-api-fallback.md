# Evidence — Bureau H2H live API fallback (2026-05-31)

## Slice

League L5 — H2H OG uses same-origin `/api` when `league`+`user` params present; `snapshot` still wins for Bureau export card.

## Commands (executed)

```text
npm run build --workspace=apps/web  → exit 0
JWT_SECRET=test python3 -m pytest apps/api/tests -q  → 51 passed, 5 skipped
curl http://localhost:3000/og/head-to-head?download=1  → 200 59305 bytes PNG
curl http://localhost:3000/og/head-to-head?download=1&league=test-league&user=u1&opponent=u2  → 200 62718 bytes PNG
file /tmp/h2h-demo.png /tmp/h2h-params.png  → PNG 1200×630
```

## Notes

- `resolveApiOrigin(req)` mirrors Lab `[panel]` OG — Edge hits same-origin rewrites.
- Subtitle: `· live league data` when API returns you/them; `· sample preview (API unavailable)` when params present but fetch fails.
- Bureau export card still passes `snapshot` — panel fidelity unchanged.

## Verdict

PASS — Gate C2/C3 (PNG ≥40KB, demo + league-param paths).
