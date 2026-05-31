# Evidence — Bureau H2H opponent subtitle (2026-05-31)

**Slice:** League L5 — OG H2H subtitle names live opponent when API fetch succeeds  
**Atom:** `bureau-h2h-opponent-subtitle` (epic 2/3)  
**Route:** `/og/head-to-head`

## Commands

| Check | Command | Result |
|-------|---------|--------|
| Web build | `npm run build --workspace=apps/web` | exit 0 |
| API tests | `JWT_SECRET=test python3 -m pytest apps/api/tests -q` | **51 passed**, 5 skipped |
| Demo fallback | `curl -s -o /tmp/h2h-demo.png -w '%{http_code} %{size_download}' 'http://localhost:3000/og/head-to-head?download=1'` | **200 59305** |
| Live params | `curl …/og/head-to-head?download=1&league=TEST&user=u1&opponent=u2` | **200 59940** |

## Subtitle paths

- **Demo:** `rivalry dossier — your roster vs one leaguemate · sample preview`
- **Live (when API returns teams):** `rivalry dossier — vs <them.team>`

`test_head_to_head_returns_managers_and_compare` confirms API returns `them.team == "Rival Team"` for live payloads.

## Verdict

**PASS** — Gate C2/C3 (PNG ≥40KB; live path names opponent; demo labeled sample preview).
