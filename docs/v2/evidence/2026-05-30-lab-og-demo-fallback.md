# Evidence — Lab L5 OG demo fallback (cycle 58)

## Ticket: LAB-OG-DEMO-FALLBACK

- **Route:** `/og/[panel]` (all 100 Lab panels)
- **Slice:** When live panel data is unavailable (preview deploys / CI without
  `terminal.db`, or parameterized panels whose `api.path` needs a `player_id`),
  the OG share card now renders representative sample player rows instead of a
  loading-copy-only shell. Mirrors the head-to-head demo fallback (FACTORY-DOD
  Gate C3).
- **DEPTH:** Lab L5 — "OG card per panel matches in-product export."
- **ACCEPTANCE:** Gate 6 / FACTORY-DOD Gate C2–C3.

### Before

On a fresh checkout with no API/`terminal.db` (the preview-deploy condition),
`fetchPanelData()` returned `[]` and the card fell into the
`icon + agent.loadingCopy` branch — a loading-copy-only shell ("pulling
film…"). Per FACTORY-DOD C3, Reality cannot PASS a loading-copy-only OG card.

### After — curl evidence (production `next start`, no API running)

```
GET /og/weekly?download=1   -> 200  63630 bytes  PNG 1200x630 (Hawkeye)
GET /og/rankings?download=1 -> 200  61870 bytes  PNG 1200x630 (Octo)
GET /og/breakouts?download=1-> 200  60830 bytes  PNG 1200x630 (Hawkeye)
GET /og/efficiency?download=1->200  59460 bytes  PNG 1200x630 (Octo)
GET /og/gamelog?download=1  -> 200  58309 bytes  PNG 1200x630 (Atlas)
```

All ≥ 40KB Gate C2 threshold. Server log: 0 Satori errors.

Screenshot: `2026-05-30-lab-og-demo-fallback.png` — Dynasty Rankings card with
Octo badge, six demo rows (Chase WR, Barkley RB, Allen QB, Robinson RB, Bowers
TE, Jefferson WR), position pills in DESIGN.md colors, FPTS column, `· sample
preview` marker, watermark.

### Bonus fix — head-to-head OG render crash (PR #12)

The H2H OG route (PR #12, "demo fallback for preview") had the **same Satori
multi-child bug**: its subtitle `<div>` held a text literal + `{isDemo ? …}`
expression with no `display:flex`, so the route crashed at render
(`failed to pipe response`, HTTP 000) — the demo fallback never rendered.

```
# before fix
GET /og/head-to-head?download=1 -> 000  0 bytes (crash)
# after fix
GET /og/head-to-head?download=1 -> 200  59305 bytes  PNG 1200x630 (Atlas)
```

Screenshot: `2026-05-30-h2h-og-render-fix.png`.

### Automated gates

```
npm run build --workspace=apps/web   -> exit 0
JWT_SECRET=test-secret pytest tests   -> 51 passed, 5 skipped
```

### Follow-up debt (not this cycle)

- H2H card has a minor footer/trade-lane text overlap (pre-existing PR #12
  layout) — cosmetic, does not block render.
- Per-panel demo stat labels are generic FPTS; live path keeps real labels.

- **Verdict:** PASS
