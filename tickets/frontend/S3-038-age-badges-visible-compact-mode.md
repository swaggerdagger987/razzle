# S3-038: Age badges render in compact density mode (should be hidden)

**Severity**: S3 (Low)
**Category**: ux-flow
**Source**: QA-AUDIT.md #5 (Phases 126-130)
**Found**: 2026-03-11 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/lab.js:1868-1872` — Age badge rendering does not check `state.density` (compact mode flag). In compact mode, row height is 26px (vs 36px normal) and age badges add visual clutter at that density.

```javascript
// lab.js:1868-1872
if (player.age) {
    var ageVal = Math.floor(player.age);
    var ageCls = ageVal <= 24 ? "age-young" : ageVal <= 27 ? "age-prime" : ageVal <= 29 ? "age-aging" : "age-vet";
    html += `<span class="age-badge ${ageCls}" title="Age ${ageVal}">${ageVal}</span>`;
}
```

The density flag is at `lab.js:1010`:
```javascript
density: (function() { try { return localStorage.getItem("razzle_density") === "1"; } catch(e) { return false; } })(),
```

Row height already respects density at `lab.js:1802`:
```javascript
return state.density ? 26 : 36;
```

## Fix

Wrap age badge rendering in density check:

```javascript
// lab.js:1868
if (player.age && !state.density) {
    var ageVal = Math.floor(player.age);
    var ageCls = ageVal <= 24 ? "age-young" : ageVal <= 27 ? "age-prime" : ageVal <= 29 ? "age-aging" : "age-vet";
    html += `<span class="age-badge ${ageCls}" title="Age ${ageVal}">${ageVal}</span>`;
}
```

## Files to Change

- `frontend/lab.js:1868` — add `&& !state.density` to existing condition

## Accept When

1. Compact density mode (D key toggle): age badges do not render
2. Normal density mode: age badges render as before
3. Toggling density mode re-renders rows correctly

## Do NOT Touch

- Age badge CSS classes or colors
- Density toggle logic itself
