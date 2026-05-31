# Evidence — lab-og-position-buysell

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 51 passed, 5 skipped
- `curl /og/buysell?download=1&position=RB` — 200 42961 PNG
