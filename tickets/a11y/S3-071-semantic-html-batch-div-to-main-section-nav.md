---
id: S3-071
severity: S3
confidence: HIGH
category: a11y
source: DQ-116+160+195+233+238+271+275
status: OPEN
---

# Semantic HTML batch — div elements should be main/section/nav/heading

## Root Cause

Multiple pages use generic `<div>` elements where semantic HTML is required:

1. **Skip link target is `<span>` not `<main>`** — `frontend/` sitewide: skip link targets `id="main-content"` on a `<div>`, should be `<main>` (DQ-116). Note: S3-009 covers the `<main>` landmark gap but this is specifically the skip-link target element.

2. **Home page sections use `<div>` not `<section>`** — `frontend/index.html`: major content sections (features, pricing, demo) lack semantic `<section>` elements (DQ-160)

3. **Footer groups use `<div>` not `<nav><ul>`** — `frontend/` sitewide: footer link groups lack `<nav>` landmark and `<ul>` list semantics (DQ-195)

4. **Pricing FAQ questions use `<div>` not headings** — `frontend/pricing.html`: FAQ question text is in `<div>` not `<h3>` or `<dt>` (DQ-233)

5. **Pricing card names use `<div>` not headings** — `frontend/pricing.html`: plan card titles ("Pro", "Elite") are `<div>` not `<h3>` (DQ-271)

6. **Pricing plan cards lack ARIA landmarks** — `frontend/pricing.html`: plan comparison cards have no `role` or landmark (DQ-275)

## Fix

Replace `<div>` with appropriate semantic elements. Each is a targeted find-replace.

## Files

- `frontend/index.html` — section elements
- `frontend/pricing.html` — FAQ headings, card headings, landmarks
- `frontend/` sitewide — footer semantics
- All 74+ pages — skip link target element type

## Acceptance Criteria

- Home sections wrapped in `<section>` elements
- Footer uses `<nav>` and `<ul>` for link groups
- Pricing FAQ uses headings or `<dl>` structure
- Pricing plan cards have heading elements and ARIA landmarks
