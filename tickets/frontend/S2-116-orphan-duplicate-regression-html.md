---
id: S2-116
severity: S2
confidence: HIGH
category: frontend
source: DQ-476
status: OPEN
---

# regression.html is an orphan duplicate of tdregression.html

## Root Cause (CONFIRMED 2026-03-29 — code investigation)

**`regression.html` is a confirmed orphan.** Both files exist but are functionally different implementations:

| | regression.html | tdregression.html |
|---|---|---|
| Size | ~26KB | ~17KB |
| CSS prefix | `.reg-` | `.tdr-` |
| Canonical URL | line 22: `/regression.html` | line 22: `/tdregression.html` |
| Analytics page | line 695: `'regression'` | line 320: `'/tdregression.html'` |
| Layout | Single-column table | Two-column card grid |
| Redirect | line 8: `→ /lab.html?panel=tdregression` | line 8: `→ /lab.html?panel=tdregression` |

**Both redirect to the same panel** — `?panel=tdregression`.

**Only `tdregression` is referenced in the Lab system:**
- `frontend/lab.html:3256` — sidebar: `data-panel="tdregression"`
- `frontend/lab-panels.js:5189-5431` — panel definition: `name: 'tdregression'`
- `frontend/lab.html:4262` — tooltip config: `tdregression: 'Season Pace'`
- `frontend/lab.html:4315` — subtitle config: `tdregression: 'touchdowns lie...'`
- `frontend/lab.html:4353` — description config

**No references to `regression.html` exist** in lab.html, lab-panels.js, or any navigation.

## Fix

1. Delete `frontend/regression.html`
2. Remove from `sitemap.xml` if listed
3. If SEO concern, add a server-side 301 redirect from `/regression.html` → `/tdregression.html`

## Acceptance Criteria

1. `frontend/regression.html` deleted
2. Lab sidebar still links to tdregression correctly
3. No broken internal links
