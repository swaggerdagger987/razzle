# DES-193: .input-chunky::placeholder and .nav-search-hint font-size: 15px — off type scale

**Priority**: P3
**Category**: Design System / Typography
**Affects**: styles.css lines 943, 1184 — every page with inputs or search hint
**Cycle**: 18

## Problem

Two selectors in styles.css use `font-size: 15px`, which is not on the design system type scale. DESIGN.md defines: 32, 24, 20, 18, 16, 14, 13, 12, 11px. 15px falls between 14px (body/nav) and 16px (section headers).

## Evidence

`styles.css:943`:
```css
.input-chunky::placeholder {
  font-size: 15px;
```

`styles.css:1184`:
```css
.nav-search-hint {
  font-size: 15px;
```

## Fix

Change both to 14px (the nearest type scale value for body text / nav elements):
```css
.input-chunky::placeholder { font-size: 14px; }
.nav-search-hint { font-size: 14px; }
```

Or 13px if they should match stat values. 14px is more likely since these are UI control text, matching the "Body text, nav links, buttons" tier in DESIGN.md.

## Why it matters

Typography scale governance. Two off-scale values today become twenty tomorrow. The type scale exists to create visual rhythm — every exception weakens it.
