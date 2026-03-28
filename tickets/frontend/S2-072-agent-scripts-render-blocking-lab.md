---
id: S2-072
severity: S2
confidence: HIGH
category: performance
source: DQ-336
status: OPEN
---

# Agent scripts render-blocking in Lab — agent-config.js and agent-nudges.js lack defer

## Root Cause

`frontend/lab.html:4045-4046`:

```html
<script src="agent-config.js"></script>
<script src="agent-nudges.js"></script>
```

These two scripts load synchronously (no `defer` attribute) while all other Lab scripts (`lab.js`, `formulas.js`, `formula-store.js`, `charts.js`, `lab-panels.js`) have `defer`. The agent scripts block rendering before the main app scripts even start parsing.

## Fix

Add `defer` attribute:
```html
<script src="agent-config.js" defer></script>
<script src="agent-nudges.js" defer></script>
```

## Files

- `frontend/lab.html:4045-4046` — script tags

## Acceptance Criteria

- Both agent scripts load with `defer`
- Lab page renders without waiting for agent scripts
- Agent personality features still initialize correctly after DOM ready
