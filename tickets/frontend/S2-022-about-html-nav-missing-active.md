---
id: S2-022
severity: S2
category: ui-bug
finding_ref: EDGE-62
confidence: HIGH
---

# S2-022: about.html nav missing active state on About link

## Root Cause

`frontend/about.html:224-234`:
```html
<ul class="nav-links">
  <li><a href="/">Home</a></li>
  <li><a href="/lab.html">Screener</a></li>
  <li><a href="/league-intel.html">Bureau</a></li>
  <li><a href="/agents.html">AI Agents</a></li>
  <li><a href="/pricing.html">Pricing</a></li>
</ul>
```

The nav does not include an "About" link with `class="active"`, so navigating to
about.html shows no active state in the navigation. Other pages (lab.html, pricing.html, etc.)
correctly set `class="active"` on their respective nav items.

## What to Fix

The About page isn't in the main nav (by design — it's a secondary page). But the
nav should still show no false active state. Check that app.js's dynamic nav builder
doesn't mark another item as active when on about.html.

If about.html uses app.js's dynamic nav (which it appears to, since it loads app.js),
then the nav builder should detect `location.pathname === '/about.html'` and not
mark any primary nav item as active.

## Files to Change

- `frontend/about.html` — Verify nav uses app.js dynamic builder
- `frontend/app.js` — Ensure about.html doesn't trigger false active state

## Acceptance Criteria

- [ ] On about.html, no nav item shows active state (or About is added to nav with active)
- [ ] All other pages still show correct active state

## Do NOT

- Do not add About to the primary nav unless design explicitly calls for it
