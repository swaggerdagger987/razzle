# Evidence — lab-og-breakouts-gate-c-live

**Date:** 2026-05-31  
**Atom:** `lab-og-breakouts-gate-c-live` — Breakouts OG Gate C pytest for live fetch path  
**Trust:** T5, T6

## Build

- `PATH=$HOME/.local/bin:$PATH python3 -m pytest apps/api/tests/test_og_breakouts_gate_c_live.py -q --noconftest` — 7 passed
- `npm run build --workspace=apps/web` — exit 0

## Gate C — breakouts OG PNG

```bash
curl -s -o /tmp/breakouts-og.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/breakouts?download=1'
# 200 66253
```

Fixture params: `download=1` (`BREAKOUTS_OG_GATE_C_PARAMS`).

## Code

- `apps/api/tests/test_og_breakouts_gate_c_live.py` — demo fallback, `fetchOgLiveRows` path, renderer/OG stat key parity, snapshot codec, export link.

## Verdict

PASS — breakouts OG ≥40KB PNG; live rows epic atom 2/3.
