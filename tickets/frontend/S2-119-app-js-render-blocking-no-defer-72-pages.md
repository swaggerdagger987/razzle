---
id: S2-119
severity: S2
confidence: HIGH
category: performance
source: DQ-167
status: OPEN
---

# app.js loaded without defer on 72 HTML pages — render blocking

## Root Cause

`app.js` is loaded synchronously (no `defer` attribute) on 72 of 76 HTML pages. This blocks HTML parsing and first paint while the browser downloads and executes app.js.

**Verified on**:
- `frontend/index.html:948` — `<script src="app.js"></script>` (no defer)
- `frontend/lab.html:4057` — `<script src="app.js"></script>` (no defer)
- `frontend/pricing.html:533` — `<script src="app.js"></script>` (no defer)
- `frontend/league-intel.html:2677` — `<script src="app.js"></script>` (no defer)
- `frontend/agents.html:2122` — `<script src="app.js"></script>` (no defer)

All other Lab scripts (lab.js, formulas.js, charts.js, lab-panels.js) already use `defer`.

Note: S2-072 covers agent-config.js and agent-nudges.js on lab.html. This ticket covers app.js globally.

## Fix

Add `defer` to all `<script src="app.js">` tags:

```html
<script src="app.js" defer></script>
```

Verify app.js does not use `document.write()` or depend on DOM being fully parsed at load time (it likely doesn't since it uses DOMContentLoaded).

## Acceptance Criteria

- [ ] All 72 pages have `<script src="app.js" defer></script>`
- [ ] No pages break due to script execution order changes
- [ ] First Contentful Paint improves (no parse-blocking script)
