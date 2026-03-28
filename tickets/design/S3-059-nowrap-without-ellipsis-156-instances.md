---
id: S3-059
severity: S3
confidence: MEDIUM
category: design
source: DQ-387
status: OPEN
---

# white-space:nowrap without text-overflow:ellipsis — 156 instances across 69 files

## Root Cause

156 instances of `white-space: nowrap` without corresponding `text-overflow: ellipsis` and `overflow: hidden`. This causes text to overflow containers on narrow viewports instead of truncating gracefully. Particularly problematic on mobile where player names and stat labels extend beyond card boundaries.

## Fix

For each `white-space: nowrap` instance, add:
```css
overflow: hidden;
text-overflow: ellipsis;
```

Exception: elements that intentionally need no-wrap without truncation (e.g., inline badges) can keep the current pattern with a `/* intentional */` comment.

## Files

- 69 files sitewide — highest concentration in lab-panels.css, standalone HTML

## Acceptance Criteria

- No text overflow on mobile viewports (375px)
- Truncated text shows ellipsis
