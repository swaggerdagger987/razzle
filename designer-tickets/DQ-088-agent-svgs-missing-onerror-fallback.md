# DQ-088: Agent icon SVGs have no onerror fallback — broken images on network failure

**Priority**: P2 — resilience / UX
**Category**: Error Handling / Images
**Files**: `frontend/agents.html` (agent badge chips), `frontend/index.html` (home agent demo section)

## Problem

Agent icon SVGs are loaded as `<img>` tags with no `onerror` handler:

```html
<img src="/assets/agents/razzle.svg" width="28" height="28" alt="">
```

If the SVG fails to load (CDN issue, ad blocker, slow network), the browser shows a broken image icon — a harsh white rectangle with a torn corner. This breaks the visual presentation of the agent chips on both the agents page and the home page demo section.

Other pages in the codebase DO have onerror handlers. For example, some standalone pages use:
```html
onerror="this.style.display='none'"
```

But the 6 agent SVGs across agents.html and index.html have no fallback.

## Fix

Add onerror fallback that hides the broken image and falls back to the emoji:

```html
<img src="/assets/agents/razzle.svg" width="28" height="28" alt="Razzle"
     onerror="this.style.display='none'">
```

Since each agent chip already has an emoji prefix (e.g., `🐯 RAZZLE`), hiding the broken SVG gracefully degrades to emoji-only — still readable, no visual breakage.

Also add descriptive alt text per DQ-009 scope (alt text for accessibility).

## Files to Check

- `frontend/agents.html` — 6 agent badge chips in the hero section
- `frontend/index.html` — agent demo cards in the "Six AI Agents" section

## Verification

1. Open agents.html with DevTools Network tab
2. Block requests to `/assets/agents/*.svg`
3. Agent chips should show emoji + name text with no broken image icons
