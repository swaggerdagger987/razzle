# Evidence — bureau-h2h-preview-card

**Cycle:** 144 | **Verdict:** PASS

- `python3 -m pytest apps/api/tests/test_bureau_h2h_share_bar.py -q` → 1 passed
- `npm run build --workspace=apps/web` → exit 0
- `curl .../og/head-to-head?download=1` → 200 75614 bytes
