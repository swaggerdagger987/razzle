<!-- PM: ready -->
---
id: DES-200
priority: P2
area: styles.css
section: design system utilities
type: root cause fix
status: open
---

# ROOT CAUSE: Add `.sticker-chip` CSS utility class for chunky badge/chip/label pattern

## Why this exists

DES-201 (tier labels), DES-202 (discovery chips), and DES-203 (prompt headers) all report the same problem: elements that should have DESIGN.md's "chunky sticker" aesthetic are flat and shadowless. The root cause is that there's no shared CSS class enforcing this pattern — each page reimplements chips from scratch and some miss the shadow/border/rotation.

## What to do

**File**: `frontend/styles.css`

Add a `.sticker-chip` utility class:

```css
.sticker-chip {
  border: 2px solid var(--ink);
  box-shadow: 3px 3px 0 var(--ink);
  border-radius: var(--radius-sm);
  padding: 4px 12px;
  font-family: var(--font-display);
  font-size: 14px;
  display: inline-block;
}

.sticker-chip--rotated {
  transform: rotate(-3deg);
}

.sticker-chip:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--ink);
}

.sticker-chip--rotated:hover {
  transform: rotate(-3deg) translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--ink);
}
```

## Accept when

- `.sticker-chip` class exists in styles.css
- Applying it to any element produces the DESIGN.md chunky sticker look
- Dark mode compatible (uses CSS vars, not hardcoded colors)
- DES-201, DES-202, DES-203 can each be fixed by adding this class

## Why this matters

Without a shared utility, every new page will reinvent the chip pattern and some will miss the shadow. Fix the system, not the symptoms.
