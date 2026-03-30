---
id: DQ-181
priority: P2
category: design-tokens/css
status: open
cycle: 27
---

# lab-panels.css `#ffd700` hardcoded gold — `var(--medal-gold)` exists but unused

## What's wrong

DES-022 (done) created the `--medal-gold: #ffd700` CSS variable in `styles.css` (lines 66 and 103). But 2 instances in `lab-panels.css` still use the raw `#ffd700` hex instead of the variable. This means:
- Dark mode overrides on `--medal-gold` won't apply to these elements
- Token changes won't propagate

## Where

| File | Line | Selector | Current |
|------|------|----------|---------|
| `frontend/lab-panels.css` | 580 | `.tv-tier-num.t1` | `background: #ffd700` |
| `frontend/lab-panels.css` | 3476 | `.rc2-badge.gold` | `background: #ffd700` |

## Fix

Replace `#ffd700` with `var(--medal-gold)`:

```css
/* Line 580 */
.tv-tier-num.t1 { background: var(--medal-gold); color: var(--ink); }

/* Line 3476 */
.rc2-badge.gold { background: var(--medal-gold); color: var(--ink); }
```

## Test

1. Open Trade Values panel — Tier 1 (Elite) badge should still be gold.
2. Open Records panel — gold badge should still be gold.
3. Toggle dark mode — gold should remain visible and themed.
