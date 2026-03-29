---
id: S3-030
severity: S3
category: a11y
finding_ref: EDGE-42
confidence: HIGH
---

# S3-030: 72 of 75 HTML pages missing noscript fallback

## Root Cause

Only 3 pages have `<noscript>` tags: `lab.html`, `league-intel.html`, `agents.html`.
The remaining 72 HTML files show a blank page if JavaScript is disabled or fails to load.

## What to Fix

Add a `<noscript>` tag to the `<body>` of all 72 pages:

```html
<noscript>
  <div style="text-align:center; padding:40px; font-family:'Space Mono',monospace; color:#2d1f14;">
    <h2>Razzle needs JavaScript</h2>
    <p>Enable JavaScript to use the fantasy football lab.</p>
  </div>
</noscript>
```

Batch this across all files. The 3 existing pages (lab.html, league-intel.html, agents.html)
can serve as the template.

## Files to Change

- 72 HTML files in `frontend/` (all except lab.html, league-intel.html, agents.html)

## Acceptance Criteria

- [ ] All 75 HTML files have a `<noscript>` fallback
- [ ] Fallback uses Razzle's design tokens (espresso color, Space Mono font)
- [ ] Fallback text is helpful, not just "enable JS"

## Do NOT

- Do not add complex fallback content — a simple message is sufficient
- Do not make the noscript content load external resources
