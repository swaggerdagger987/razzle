## Ticket: B-002
- Route: `/api/panels/{slug}` for launch-10 Lab panels
- Before: launch-10 handler/render-type expectations lived in docs and component conventions, but tests did not pin the catalog contract.
- After: `test_panels.py` verifies each launch-10 slug maps to the expected legacy handler and render type, and each slug route resolves under a Pro plan.
- Verification:
  - `JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_panels.py -q` — PASS
  - `JWT_SECRET=test-secret python3 -m pytest apps/api/tests/test_panels.py apps/api/tests/test_smoke.py -q` — PASS
- Verdict: PASS
