---
id: DQ-451
priority: P1
category: broken-visual
status: open
cycle: 58
---

# DQ-451: .btn-outline class used in 8 instances across 4 pages — no CSS definition exists

## Problem

Eight buttons across 4 standalone pages use `class="btn btn-outline"` but **neither `.btn` (base) nor `.btn-outline` is defined in styles.css or any other stylesheet**. These buttons render completely unstyled — no border, no padding, no shadow, no hover. They look like plain text links at best, invisible at worst.

## Evidence

Files using `.btn-outline`:
- `frontend/breakdown.html` (lines ~374, ~587) — 2 instances
- `frontend/regression.html` (lines ~356, ~497) — 2 instances
- `frontend/strengths.html` (lines ~441, ~680) — 2 instances
- `frontend/weeklyleaders.html` (lines ~310, ~453) — 2 instances

Verification:
```bash
grep -rn "btn-outline" frontend/styles.css          # 0 matches
grep -rn "btn-outline" frontend/lab-panels.css       # 0 matches
grep -rn "btn-outline" frontend/*.html               # 8 matches
```

## Fix

Add `.btn-outline` to `styles.css` following the chunky button spec:

```css
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  background: transparent;
  border: 2px solid var(--ink);
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0 var(--ink);
  cursor: pointer;
  transition: box-shadow 0.12s ease, transform 0.12s ease;
}
.btn-outline:hover {
  box-shadow: 4px 4px 0 var(--ink);
  transform: translate(-2px, -2px);
}
.btn-outline:focus-visible {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}
```

## Why It Matters

These 8 buttons are completely broken visually. Users on these 4 pages see unstyled text where chunky buttons should be.

## Verification

Open breakdown.html, regression.html, strengths.html, weeklyleaders.html. All buttons should render with chunky borders and lift on hover.
