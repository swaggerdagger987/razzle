# S2-043: Tiers page cream text uses hardcoded rgba with poor contrast

**Severity**: S2 (Medium)
**Category**: design
**Source**: designer-tickets DQ-015
**Found**: 2026-03-25 (verified 2026-03-28)
**Status**: OPEN

## Root Cause

`frontend/tiers.html:146,151,224` — Tier labels use hardcoded `rgba(237,224,207,...)` for text, which:
1. Has poor contrast on lighter tier backgrounds (yellow, teal)
2. Won't adapt to dark mode theme changes
3. Should use `var(--text-on-accent)` for proper contrast

**Current values**:
```css
/* tiers.html:146 */ .tl-tier-letter { text-shadow: 2px 2px 0 rgba(45,31,20,0.2); }
/* tiers.html:151 */ .tl-tier-count { color: rgba(237,224,207,0.8); }
/* tiers.html:224 */ .tl-tier-header-text { color: rgba(237,224,207,0.7); }
```

The `.tl-tier-count` and `.tl-tier-header-text` use raw sand-colored rgba on colored backgrounds. On lighter tiers (B=yellow, C=teal), the sand text barely meets contrast requirements.

## Fix

```css
/* tiers.html:146 */ .tl-tier-letter { text-shadow: 2px 2px 0 var(--ink); } /* use CSS var */
/* tiers.html:151 */ .tl-tier-count { color: var(--text-on-accent); opacity: 0.8; }
/* tiers.html:224 */ .tl-tier-header-text { color: var(--text-on-accent); opacity: 0.7; }
```

`var(--text-on-accent)` is already defined in styles.css and flips correctly in dark mode.

## Files to Change

- `frontend/tiers.html:146,151,224` — 3 property updates

## Accept When

1. Tier letter text-shadow uses CSS variable, not hardcoded rgba
2. Tier count and header text use `var(--text-on-accent)` with opacity
3. Text is readable on all 6 tier colors (S=red, A=orange, B=yellow, C=teal, D=blue, F=brown)
4. Dark mode: text adapts correctly

## Do NOT Touch

- Tier background colors (`.tl-tier-label.S`, etc.) — those use correct CSS vars
- `tiers.html:434` — canvas code, separate concern
