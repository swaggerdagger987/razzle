---
id: DQ-058
priority: P2
category: color tokens
pages: archetypes.html, auction.html
status: open
---

# Standalone pages hardcode position color hex in rgba() backgrounds

## What's wrong

Two standalone page stylesheets use hardcoded RGBA values with position color hex instead of CSS variables. These won't respond to any future theme or position color changes.

**archetypes.html** (4 rules, lines 150-153):
```css
.ar-arch-badge.QB { background: rgba(91,127,255,0.12); color: var(--qb); border-color: var(--qb); }
.ar-arch-badge.RB { background: rgba(46,196,182,0.12); color: var(--rb); border-color: var(--rb); }
.ar-arch-badge.WR { background: rgba(217,119,87,0.12); color: var(--wr); border-color: var(--wr); }
.ar-arch-badge.TE { background: rgba(139,92,246,0.12); color: var(--te); border-color: var(--te); }
```

**auction.html** (2 rules, lines 234-235):
```css
.av-tier-badge.value { background: rgba(46,196,182,0.12); color: var(--rb); border-color: var(--rb); }
.av-tier-badge.bargain { background: rgba(91,127,255,0.12); color: var(--qb); border-color: var(--qb); }
```

The `color` and `border-color` reference undefined `var(--qb/--rb)` (see DQ-051), while the `background` hardcodes the same hex values as RGB integers.

## Evidence

- archetypes.html lines 150-153: `rgba(91,127,255,0.12)` = QB blue `#5b7fff`
- archetypes.html: `rgba(46,196,182,0.12)` = RB teal `#2ec4b6`
- archetypes.html: `rgba(217,119,87,0.12)` = WR terracotta `#d97757`
- archetypes.html: `rgba(139,92,246,0.12)` = TE purple `#8b5cf6`
- auction.html lines 234-235: same pattern

## Fix

After fixing DQ-051 (var names), use CSS `color-mix()` or light tint variables:
```css
.ar-arch-badge.QB { background: var(--blue-light); color: var(--pos-qb); border-color: var(--pos-qb); }
.ar-arch-badge.RB { background: var(--green-light); color: var(--pos-rb); border-color: var(--pos-rb); }
.ar-arch-badge.WR { background: var(--orange-light); color: var(--pos-wr); border-color: var(--pos-wr); }
.ar-arch-badge.TE { background: var(--purple-light); color: var(--pos-te); border-color: var(--pos-te); }
```

The `--*-light` tint variables are already defined in styles.css and match the 12% opacity intent.

## Files
- `frontend/archetypes.html` (lines 150-153)
- `frontend/auction.html` (lines 234-235)
