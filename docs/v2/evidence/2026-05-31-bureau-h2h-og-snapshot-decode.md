# Evidence — Bureau H2H OG snapshot decode (2026-05-31)

**Slice:** `bureau-h2h-og-snapshot-decode` — OG route prefers exported snapshot over API refetch  
**Atom:** 3/3 — League L5 Bureau H2H export parity epic  
**Content commit:** b0808083 (on base; parallel factory cycle verified)

## Acceptance

| Check | Result |
|-------|--------|
| `npm run build --workspace=apps/web` | PASS |
| `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | 51 passed, 5 skipped |
| Baseline OG (demo fallback) | `200 59305` bytes PNG |
| Snapshot OG (`from panel` subtitle) | `200 57091` bytes PNG |

## Routes

- `GET /og/head-to-head?download=1` — demo when no league/API
- `GET /og/head-to-head?download=1&snapshot=<base64url>` — skips API; subtitle includes `from panel`

## Verdict

**PASS** — FACTORY-DOD Gate C satisfied (PNG ≥40KB); T1 honest labels (sample vs panel export vs live).
