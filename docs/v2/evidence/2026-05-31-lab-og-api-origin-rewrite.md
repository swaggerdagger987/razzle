# Evidence — Lab OG API origin rewrite (2026-05-31)

## Slice

`resolveApiOrigin` returns `new URL(req.url).origin` so Edge OG hits Next `/api` rewrites.

## Executed

- `npm run build --workspace=apps/web` — exit 0
- `JWT_SECRET=test python3 -m pytest apps/api/tests -q` — 56 passed
- `curl http://127.0.0.1:3000/og/rankings?download=1` — 200 61061 bytes PNG
