---
id: DQ-199
priority: P3
category: shadows
status: open
---

# DQ-199: Status badge uses primary 4px shadow — should use secondary 2px

## Problem

DESIGN.md shadow hierarchy:
- **Primary** (cards, containers): `4px 4px 0 var(--ink)`
- **Secondary** (chips, badges): smaller or no shadow

In `lab.js` line 11692, a status badge (competing_status indicator) uses the full primary shadow:
```javascript
style="... border:2px solid var(--ink); border-radius:8px; box-shadow:4px 4px 0 var(--ink) ..."
```

Status badges are small secondary elements. A `4px 4px 0` shadow on a tiny pill badge makes it visually compete with the card it sits inside. Secondary elements should use `2px 2px 0` or no shadow.

## Fix

```javascript
box-shadow:4px 4px 0 var(--ink)  →  box-shadow:2px 2px 0 var(--ink)
```

## Scope

1 edit in `frontend/lab.js` line 11692.
