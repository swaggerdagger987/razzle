---
id: S3-096
severity: S3
confidence: MEDIUM
category: design
source: DQ-092+142+143+150+200+203+211
status: OPEN
---

# Typography governance — line-height, font-weight, text-wrap ungoverned

## Problems

1. **21 distinct line-height values** (DQ-092) — No tokens. Values range from `1` to `2.2` with no semantic grouping (tight/normal/loose).
2. **19 instances of `font-weight: 400` on Caveat** (DQ-142) — Caveat is loaded at weights 500/600/700. Setting 400 causes browser to approximate, creating inconsistent rendering across engines.
3. **No h1/h2 baseline sizing in styles.css** (DQ-143) — Each page defines its own heading sizes, creating 8+ different h1 sizes across the site.
4. **No `text-wrap: balance` on headings** (DQ-150) — Headings with uneven line breaks on mobile. `text-wrap: balance` would fix this with progressive enhancement.
5. **Security disclosure uses 15px Caveat** (DQ-200) — Handwriting font at small size for important legal/security information. Should be Space Mono.
6. **Price unit "/yr" uses display font** (DQ-203) — Luckiest Guy on pricing suffix. Should be Space Mono for readability.
7. **Logo text faux-bold on Luckiest Guy** (DQ-211) — Luckiest Guy is single-weight. `font-weight: bold` causes browser to artificially bold it, creating visual artifacts.

## Fix

Define CSS tokens for line-height (--lh-tight: 1.2, --lh-normal: 1.5, --lh-loose: 1.8). Set global h1/h2 sizing. Fix Caveat weight to 500 minimum. Remove bold from Luckiest Guy.

## Files

- `frontend/styles.css` — token definitions, global heading sizes
- Sitewide — replace raw line-height values
- `frontend/pricing.html` — price unit font
- `frontend/index.html` or `frontend/about.html` — security disclosure font

## Acceptance Criteria

1. line-height uses 3 tokens (tight/normal/loose)
2. Caveat never set to weight < 500
3. Luckiest Guy never set to bold
4. h1/h2 have consistent base sizes from styles.css
