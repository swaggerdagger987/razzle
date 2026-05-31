# Evidence — Lab L5 dashboard OG Gate C

**Date:** 2026-05-31  
**Atom:** `lab-og-dashboard-live-gate-c`  
**Route:** `/og/dashboard?download=1&snapshot=<fixture>`

## Gate C

```bash
curl -s -o /tmp/og-dashboard.png -w "%{http_code} %{size_download}\n" \
  "http://127.0.0.1:3000/og/dashboard?download=1&snapshot=W3sibiI6IkphJ01hcnIgQ2hhc2UiLCJwIjoiV1IiLCJ0IjoiQ0lOIiwicyI6MTIuNCwic2wiOiJDaGcifSx7Im4iOiJNYWlrbiBOYWJlcnMiLCJwIjoiV1IiLCJ0IjoiTllHIiwicyI6OS44LCJzbCI6IkNoZyJ9LHsibiI6IkRhdmFudGUgQWRhbXMiLCJwIjoiV1IiLCJ0IjoiTllKIiwicyI6LTguMiwic2wiOiJDaGcifSx7Im4iOiJMYWRkIE1jQ29ua2V5IiwicCI6IldSIiwidCI6IkxBQyIsInMiOjEwLjIsInNsIjoiQ2hnIn0seyJuIjoiQnJpYW4gVGhvbWFzIiwicCI6IlJCIiwidCI6IkpBWCIsInMiOjcuMSwic2wiOiJDaGcifSx7Im4iOiJKb25hdGhhbiBUYXlsb3IiLCJwIjoiUkIiLCJ0IjoiSU5EIiwicyI6Ni41LCJzbCI6IkNoZyJ9XQ"
# 200 65995
```

PNG ≥ 40KB with named rows — PASS candidate.

## Tests

```text
JWT_SECRET=test python3 -m pytest apps/api/tests/test_og_dashboard_gate_c_curl.py -q --noconftest
3 passed
npm run build --workspace=apps/web — exit 0
```

**Verdict:** PASS
