---
id: S2-083
severity: S2
confidence: HIGH
category: performance
source: DQ-337
status: OPEN
---

# Lab page has 3105-line inline style block — uncacheable, hurts TTFB

## Root Cause

`frontend/lab.html:29-3134` contains a single massive `<style>` block of 3105 lines. This CSS is:

- Sent with every Lab page request (not cacheable as a separate file)
- Blocks first paint until fully parsed
- Duplicates styles that could be in styles.css or lab-panels.css
- Makes the HTML document ~100KB larger than necessary

## Fix

Extract the inline CSS into a separate `lab.css` file:
1. Move lines 29-3134 to `frontend/lab.css`
2. Replace with `<link rel="stylesheet" href="lab.css">`
3. This allows browser caching and parallel download

## Files

- `frontend/lab.html:29-3134` — inline style block

## Acceptance Criteria

- Lab CSS in external file, loaded via `<link>` tag
- Lab page renders identically
- HTML document size reduced by ~100KB
- CSS file independently cacheable
