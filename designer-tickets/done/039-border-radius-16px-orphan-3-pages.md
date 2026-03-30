# DES-039: border-radius: 16px orphan on 3 pages — not a design token

**Priority**: P2
**Area**: about.html, index.html, league-intel.html
**Impact**: 16px border-radius is used on 3 components across 3 pages. It's not a design token (8/12/20 are). DES-028 covered the auth modal's 16px — this ticket covers the remaining 3 instances.

## The Problem

`about.html` line 125:
```css
.data-source-badge {
  border-radius: 16px;  /* ← not a token */
}
```

`index.html` line 145:
```css
.screener-visual-card {
  border-radius: 16px;  /* ← not a token */
}
```

`league-intel.html` line 36:
```css
.connect-card {
  border-radius: 16px;  /* ← not a token */
}
```

DESIGN.md tokens: `--radius-sm` = 8px, `--radius` = 12px, `--radius-lg` = 20px. 16px falls between `--radius` and `--radius-lg`.

## The Fix

- `.data-source-badge` → `--radius-lg` (20px) — it's a pill-shaped badge
- `.screener-visual-card` → `--radius` (12px) — it's a card container
- `.connect-card` → `--radius` (12px) — it's a card container

## Why This Matters

The connect-card on league-intel.html is the Bureau's front door — the conversion gateway. Using a non-token radius makes it feel like a different product from the rest of the site. Design token governance ensures every component "belongs."
