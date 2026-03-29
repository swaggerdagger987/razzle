---
id: S2-019
severity: S2
category: ux-flow
finding_ref: EDGE-41
confidence: HIGH
---

# S2-019: Breadcrumbs are plain text, not clickable links

## Root Cause

`frontend/lab.html:4481`:
```javascript
header.innerHTML = '<span class="breadcrumb">' + escapeHtml('Screener > ' + cat + ' > ' + label) + '</span>' + ...
```

Breadcrumbs are rendered as a single `<span>` with escaped text. The `>` separators
and category names are not interactive. Users cannot click "Screener" to go back to
the panel list or click a category to see all panels in that category.

## What to Fix

Replace the single span with clickable segments:

```javascript
header.innerHTML = '<span class="breadcrumb">' +
  '<a href="#" onclick="closePanelView(); return false;">Screener</a>' +
  ' > ' +
  '<a href="#" onclick="filterPanelsByCategory(\'' + escapeHtml(cat) + '\'); return false;">' + escapeHtml(cat) + '</a>' +
  ' > ' +
  '<span>' + escapeHtml(label) + '</span>' +
  '</span>' + ...
```

Style breadcrumb links with `color: var(--orange); text-decoration: none;` and
`:hover { text-decoration: underline; }`.

## Files to Change

- `frontend/lab.html` — Update breadcrumb rendering at line 4481
- `frontend/lab.html` or `frontend/lab.js` — Add `filterPanelsByCategory()` if it doesn't exist

## Acceptance Criteria

- [ ] "Screener" segment is clickable and returns to panel list
- [ ] Category segment is clickable and filters to that category
- [ ] Current panel name is not clickable (plain text)
- [ ] Links styled with --orange color, underline on hover
- [ ] Keyboard accessible (tab-focusable, Enter activates)

## Do NOT

- Do not change the breadcrumb structure for the main screener view (only panel views)
