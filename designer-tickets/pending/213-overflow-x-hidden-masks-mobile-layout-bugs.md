---
id: DES-213
title: overflow-x:hidden on html/body masks mobile overflow bugs
priority: P2
category: mobile-ux
page: index.html, pricing.html
agent: Razzle
created: 2026-03-23
cycle: 20
---

## What's wrong

At mobile breakpoints (480px and below), `overflow-x: hidden` is applied to `html, body`. This masks horizontal overflow bugs instead of fixing them. If any element exceeds the viewport width, the content is silently clipped — users can't scroll to see it.

## Evidence

index.html line 601:
```css
@media (max-width: 480px) {
  html, body { overflow-x: hidden; }
```

pricing.html line 60:
```css
@media (max-width: 480px) {
  html, body { overflow-x: hidden; }
```

This is a well-known anti-pattern. If there's horizontal overflow, the correct fix is to find the element causing it (usually a fixed-width element, padding, or box-sizing issue) and fix that element directly.

## Why it matters

62% of Reddit/Twitter traffic is mobile. If a table, card, or inline-style grid overflows at 375px, the user simply can't see the clipped content. Since `overflow-x: hidden` suppresses the scrollbar, there's no visual indication that content is missing. This hides bugs rather than fixing them.

## Fix

1. Remove `overflow-x: hidden` from both files
2. Test at 375px — identify any horizontal overflow
3. Fix the actual overflow sources (usually inline-style fixed widths, padding, or box-sizing)
4. If no overflow exists after testing, the rule was defensive and safe to remove

## Scope

index.html line 601, pricing.html line 60. 2 lines to remove, then test for actual overflow.
