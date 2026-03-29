---
id: S2-117
severity: S2
confidence: HIGH
category: a11y
source: DQ-493
status: OPEN
---

# Leader dots use color as only rank distinction (WCAG 1.4.1)

## Root Cause

Gold/silver/bronze leader dots all render the same Unicode bullet (&#9679;) with only color differentiating 1st/2nd/3rd place. No shape, text, or ARIA label distinguishes them.

**File**: `frontend/lab.js:5589-5591`

```javascript
if (rank === 1) return '<span class="leader-dot leader-gold" title="1st">&#9679;</span>';
if (rank === 2) return '<span class="leader-dot leader-silver" title="2nd">&#9679;</span>';
if (rank === 3) return '<span class="leader-dot leader-bronze" title="3rd">&#9679;</span>';
```

CSS in `frontend/lab.html:1091-1093`:
```css
.leader-gold { color: var(--yellow); }
.leader-silver { color: var(--ink-light); }
.leader-bronze { color: var(--orange); }
```

`title` attribute is not reliably announced by screen readers.

## Fix

Replace identical bullets with distinct symbols AND add `aria-label`:

```javascript
if (rank === 1) return '<span class="leader-dot leader-gold" aria-label="1st place">&#9733;</span>'; // ★ star
if (rank === 2) return '<span class="leader-dot leader-silver" aria-label="2nd place">&#9670;</span>'; // ◆ diamond
if (rank === 3) return '<span class="leader-dot leader-bronze" aria-label="3rd place">&#9679;</span>'; // ● circle
```

## Acceptance Criteria

- [ ] Each rank uses a different symbol (star, diamond, circle or similar)
- [ ] Each span has `aria-label="Nth place"`
- [ ] Color-blind users can distinguish all three ranks by shape alone
