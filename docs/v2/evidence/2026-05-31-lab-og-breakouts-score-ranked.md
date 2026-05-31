# Evidence — lab-og-breakouts-score-ranked (cycle 96)

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
- `curl http://localhost:3000/og/breakouts?download=1` — 200, 60649 bytes PNG
