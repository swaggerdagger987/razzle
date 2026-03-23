---
id: DES-354
priority: P3
area: about.html
section: meta tags
type: content accuracy / SEO
status: open
---

# About page meta description says "70+ analytics tools" — inconsistent with page content

## What's wrong

The about page has three different claims about what Razzle offers:

1. **Meta description (line 9)**: "70+ analytics tools"
2. **Twitter description (line 18)**: "70+ analytics tools"
3. **Page content (line 218)**: "100+ stat columns, 70+ analytical panels"

"70+ analytics tools" (meta) vs "70+ analytical panels" (body) vs "100+ stat columns" (body) — three different framings of the product. "Tools" and "panels" and "columns" are different things. A user who sees the meta description in Google and then reads the page gets inconsistent messaging.

Additionally, the meta description at line 21 says "70+ analytics tools, custom formulas, and AI agents" while the page body says "100+ stat columns, 70+ analytical panels." These don't match.

## Where

- `frontend/about.html` line 9: `og:description` — "70+ analytics tools"
- `frontend/about.html` line 18: `twitter:description` — "70+ analytics tools"
- `frontend/about.html` line 21: `meta description` — "70+ analytics tools"
- `frontend/about.html` line 218: page body — "100+ stat columns, 70+ analytical panels"

## Suggested fix

Align all descriptions to use the canonical claim (whatever is decided for DES-347):
- If "100+ stat columns" stays: meta should say "100+ stat columns, 70+ analytical panels"
- If adjusted to "85+ NFL stat columns": meta should match
- "Tools" should become "panels" everywhere since that's the product term

## Why this matters

SEO consistency. Google may show the meta description in search results. If it says "70+ analytics tools" but the page says "100+ stat columns, 70+ analytical panels," users feel misled.
