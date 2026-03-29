# S2-042: Button shadows undersized and hover lift too small

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets DQ-002, DQ-003
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/styles.css:753-801` — `.btn-chunky` and `.btn-primary` use undersized shadows and translate values that don't match DESIGN.md specifications.

**Current values**:
```css
/* styles.css:763 */ .btn-chunky { box-shadow: 2px 2px 0 var(--ink); }        /* should be 4px 4px 0 */
/* styles.css:768 */ .btn-chunky:hover { box-shadow: 3px 3px 0; transform: translate(-1px, -1px); }  /* should be 6px 6px 0 + translate(-2px, -2px) */
/* styles.css:773 */ .btn-chunky:active { box-shadow: 1px 1px 0; }            /* should be 2px 2px 0 */
/* styles.css:791 */ .btn-primary { box-shadow: 2px 2px 0 var(--ink); }        /* should be 4px 4px 0 */
/* styles.css:796 */ .btn-primary:hover { box-shadow: 3px 3px 0; transform: translate(-1px, -1px); }  /* should be 6px 6px 0 + translate(-2px, -2px) */
/* styles.css:801 */ .btn-primary:active { box-shadow: 1px 1px 0; }            /* should be 2px 2px 0 */
```

**DESIGN.md spec**: Cards rest at `4px 4px 0`, hover at `6px 6px 0 + translate(-2px, -2px)`. Buttons should follow the same system.

## Fix

In `frontend/styles.css`, update these 6 declarations:

```css
/* :763 */ .btn-chunky { box-shadow: 4px 4px 0 var(--ink); }
/* :768 */ .btn-chunky:hover { box-shadow: 6px 6px 0 var(--ink); transform: translate(-2px, -2px); }
/* :773 */ .btn-chunky:active { box-shadow: 2px 2px 0 var(--ink); transform: translate(1px, 1px); }
/* :791 */ .btn-primary { box-shadow: 4px 4px 0 var(--ink); }
/* :796 */ .btn-primary:hover { box-shadow: 6px 6px 0 var(--ink); transform: translate(-2px, -2px); }
/* :801 */ .btn-primary:active { box-shadow: 2px 2px 0 var(--ink); transform: translate(1px, 1px); }
```

## Files to Change

- `frontend/styles.css:763,768,773,791,796,801` — 6 property updates

## Accept When

1. `.btn-chunky` resting shadow is `4px 4px 0`
2. `.btn-chunky:hover` shadow is `6px 6px 0` with `translate(-2px, -2px)`
3. `.btn-primary` matches same pattern
4. `:active` state uses `2px 2px 0` (pressed feel)
5. Visual check: buttons lift on hover like cards do

## Do NOT Touch

- `.btn-chunky.active` (toggle state) — unrelated to hover lift
- Button padding, font-size, or color — only shadows and transforms
