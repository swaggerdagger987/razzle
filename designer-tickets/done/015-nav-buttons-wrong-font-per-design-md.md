---
id: DES-015
priority: P2
area: sitewide (styles.css)
status: open
created: 2026-03-22
---

# DES-015: Nav links and buttons use mono font — DESIGN.md type scale says display

## What's Wrong

DESIGN.md type scale explicitly assigns the Display font (Luckiest Guy) to:
- **14px | 400/600 | Display | Body text, nav links, buttons**
- Display font description: "Headings, player names, nav labels, buttons."

But the implementation uses Space Mono everywhere:

- `.nav-links a` (line 186) — `font-family: var(--font-mono); font-size: 13px;`
- `.btn-chunky` (line 686) — `font-family: var(--font-mono); font-size: 13px;`
- `.btn-primary` (line 710) — `font-family: var(--font-mono); font-size: 13px;`

Meanwhile, the `.btn-hero` on the home page correctly uses `var(--font-display)`. So the home page hero buttons are in display font, but all other buttons across the entire site are in mono.

## Why It Matters

This is either a code-vs-spec mismatch (code is wrong) or a spec-vs-reality mismatch (DESIGN.md is wrong). Either way, it needs resolution.

If the decision is that Luckiest Guy is too wobbly for small UI elements, update DESIGN.md to reflect the actual pattern: Display for hero/heading elements, Mono for nav/buttons at small sizes.

If the decision is to follow DESIGN.md, update all three CSS rules to use `var(--font-display)` at 14px.

## Fix

**Option A (update code to match DESIGN.md):**
```css
.nav-links a { font-family: var(--font-display); font-size: 14px; }
.btn-chunky { font-family: var(--font-display); font-size: 14px; }
.btn-primary { font-family: var(--font-display); font-size: 14px; }
```

**Option B (update DESIGN.md to match code):**
Revise the type scale to specify Mono for nav links and buttons at 13px, restricting Display to headings and hero elements.

**Recommendation:** Option B is likely the right call — Luckiest Guy at 13px for buttons would be hard to read. But the spec and implementation should agree.

## Files

- `frontend/styles.css` — `.nav-links a` (line 186), `.btn-chunky` (line 686), `.btn-primary` (line 710)
- `docs/DESIGN.md` — type scale table (if Option B)
