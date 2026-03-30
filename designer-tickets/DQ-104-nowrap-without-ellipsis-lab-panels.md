# DQ-104: 50 white-space:nowrap rules without text-overflow:ellipsis in lab-panels.css

**Priority**: P2
**Category**: Responsive / overflow
**Severity**: Medium — causes horizontal overflow on tablet (768px) and narrow viewports
**Evidence**: Code search — 68 `white-space:nowrap` in lab-panels.css, only 18 paired with `text-overflow:ellipsis` (50 unmatched)

## What's wrong

`white-space: nowrap` prevents text wrapping, which is correct for player names and stat labels. But without the full truncation pattern (`overflow: hidden; text-overflow: ellipsis`), long text pushes containers wider than their parent, causing horizontal scrollbars or layout overflow.

This is especially visible on tablet (768px) where panel tables are narrower but text still refuses to wrap.

## Where

- `frontend/lab-panels.css` — 50 of 68 nowrap rules lack ellipsis pairing
- Affects: panel table headers, stat labels, category names, badge text within Lab panels

## Pattern that should always be together

```css
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

If `nowrap` is used without the other two, text can overflow its container.

## Fix

Audit all 68 `white-space: nowrap` in lab-panels.css. For each one:
- If the element has a fixed/max width: add `overflow: hidden; text-overflow: ellipsis`
- If the element is in a flex container: add `min-width: 0; overflow: hidden; text-overflow: ellipsis`
- If nowrap is genuinely unnecessary (element content is always short): remove the nowrap

Estimate: 50 rules need the ellipsis pair added.

## Verification

Open the Lab at 768px tablet width. Open any panel (dashboard, trade values, breakouts). No horizontal overflow on any table.
