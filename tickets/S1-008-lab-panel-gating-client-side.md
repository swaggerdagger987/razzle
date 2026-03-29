---
id: S1-008
severity: S1
category: security
title: "Lab panel data gating is client-side only — Pro analytical data accessible via public API"
status: closed-accepted-risk
audit: DEEP-AUDIT-TICKETS.md
---

# S1-008: Free tier panel gating is client-side only (bypassable)

## Finding

Pro-locked panels in the Lab check `isPaidUser()` in JavaScript. A technically savvy user can bypass this.

## Root Cause Investigation

**Client-side gate** — `frontend/lab.html:4446`:
```javascript
if (!FREE_PANELS[panelName] && typeof isPaidUser === 'function' && !isPaidUser()) {
  _showUpgradeGate(panelName);
  ...
}
```

`FREE_PANELS` (lab.html:4087-4091) defines 11 free panels. The remaining 60+ panels show an upgrade prompt.

**Server-side enforcement** — `backend/server.py:899-911` (`require_plan()`) protects:
- API key storage, LLM chat, cloud sync, formula publishing, briefings, agent memory, Sleeper refresh, roster-grade, compare

**NOT server-gated** (public API endpoints used by Pro-locked Lab panels):
- `/api/screener/query` — all data for all panels flows through this
- `/api/dynasty-rankings`, `/api/tier-list`, `/api/auction-values` — public
- `/api/matchup-heatmap`, `/api/usage-trends`, `/api/air-yards` — public
- All analytical endpoints are open — they are the SAME endpoints free panels use

**The gap**: A free user can `fetch('/api/matchup-heatmap')` directly in the browser console and get the same data that's shown in the Pro-locked "Matchups" panel. The gating is purely UI.

## Fix Options

1. **Accept the risk**: The free panels + public API is a feature (data is free, the UI is the product). Many SaaS tools do this intentionally.
2. **Server-side gate**: Add `require_plan()` to Pro-locked analytical endpoints. This is a larger change — ~30 endpoints need gating.
3. **Hybrid**: Keep data endpoints public but add rate limiting for unauthenticated requests (e.g., 10 req/min vs 100 for Pro).

## Impact

Revenue leak: any user who opens DevTools can access all 60+ Pro panels' data without paying. However, the effort required (manually hitting API endpoints) limits the practical impact to technically savvy users.

## Acceptance Criteria

- [x] Decision made: **Accept risk** (Option 1). Data is free, the UI is the product. The Lab
  experience (70+ panels, visual polish, keyboard shortcuts, export) is the value prop — not raw
  API data. Matches North Star philosophy. Server-side gating would require 30+ endpoint changes
  and break the "free research lab" identity. Revisit post-launch if API abuse becomes measurable.
- [ ] ~~If server-side: Pro-locked panel endpoints return 403 for free users~~ (not implementing)
- [ ] ~~If hybrid: Rate limiting differentiates free vs Pro API access~~ (not implementing)
