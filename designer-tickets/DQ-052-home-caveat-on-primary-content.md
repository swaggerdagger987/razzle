---
id: DQ-052
priority: P1
category: typography
page: index.html
status: open
---

# Home page uses Caveat (handwritten font) for primary selling content

## What's wrong

DESIGN.md line 123: "Caveat is never primary information. Always a comment, aside, margin note."

Three CSS rules on the home page apply `var(--font-hand)` (Caveat) to **primary selling content** — the first things users read:

1. `.hero-sub` (line 94): "100+ stat columns. Custom formulas. Shareable views. No account required. No catch."
2. `.lp-section p` (line 259): ALL section description paragraphs including "ChatGPT doesn't know your league. Razzle does." and feature descriptions
3. `.screener-visual-footer p` (line 235): screener section footer text

These are core selling propositions, not margin notes. Caveat makes them look informal/secondary when they should feel authoritative.

## Evidence

- index.html line 94: `font-family: var(--font-hand);` on `.hero-sub`
- index.html line 259: `font-family: var(--font-hand);` on `.lp-section p`
- index.html line 235: `font-family: var(--font-hand);` on `.screener-visual-footer p`
- Screenshot: hero subtitle visible in Caveat handwriting below the display-font headline

## Fix

Change these rules to use `var(--font-mono)` (Space Mono) at appropriate size:
```css
.hero-sub { font-family: var(--font-mono); font-size: 16px; font-weight: 400; }
.lp-section p { font-family: var(--font-mono); font-size: 15px; }
.screener-visual-footer p { font-family: var(--font-mono); font-size: 14px; }
```

Keep Caveat only for actual margin notes: loading states, card scribbles, annotations.

## Files
- `frontend/index.html` (lines 94, 235, 259 in `<style>` block)
