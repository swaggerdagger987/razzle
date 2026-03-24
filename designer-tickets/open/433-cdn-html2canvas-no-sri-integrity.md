---
id: DQ-433
priority: P2
area: 10 standalone HTML pages
section: security / third-party deps
type: security hardening
status: open
cycle: 56
---

# 10 standalone pages load html2canvas from jsDelivr CDN without SRI integrity hash

## What's wrong

10 standalone pages load html2canvas from `cdn.jsdelivr.net` without `integrity` or `crossorigin` attributes. A compromised CDN could inject malicious JavaScript that executes in the user's browser with full page access.

## Where

All have the same unprotected script tag:
```html
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
```

1. `frontend/drops.html:194`
2. `frontend/dualthreat.html:186`
3. `frontend/gamescript.html:197`
4. `frontend/garbagetime.html:184`
5. `frontend/seasonpace.html:179`
6. `frontend/snapefficiency.html:184`
7. `frontend/successrate.html:184`
8. `frontend/targetpremium.html:183`
9. `frontend/tdregression.html:188`
10. `frontend/workload.html:184`

## Fix

Add SRI hash and crossorigin attribute:
```html
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"
        integrity="sha384-{computed-hash}"
        crossorigin="anonymous"></script>
```

Generate the hash: `curl -s https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js | openssl dgst -sha384 -binary | openssl base64 -A`

## Not a duplicate of

- DQ-364: covers CDN fallback (hertzen.com → jsdelivr), not SRI integrity
- DQ-359: covers lazy-loading html2canvas, not SRI

## Why this matters

SRI is a defense-in-depth measure. If jsdelivr is compromised, the browser refuses to execute the script because the hash won't match. This protects users' auth tokens and localStorage data.
