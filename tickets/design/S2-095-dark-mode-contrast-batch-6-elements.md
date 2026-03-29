---
id: S2-095
severity: S2
confidence: HIGH
category: dark-mode
source: DQ-342+343+344+345+309+286
status: OPEN
---

# Dark mode contrast failures — 6 elements with unreadable or broken dark mode

## Root Cause

Multiple elements have no dark mode overrides or use colors that fail contrast in dark theme:

1. `frontend/pricing.html` — trial banner uses hex fallback that defeats dark mode variable resolution (DQ-342)
2. `frontend/app.js:900-908` — auth input fields have no `-webkit-autofill` dark mode styling; browser autofill paints white background on dark form (DQ-343)
3. `frontend/pricing.html` — promo/celebration cards have no `[data-theme="dark"]` overrides (DQ-344)
4. `frontend/seasonpace.html` — milestone badge colors don't adapt to dark mode (DQ-345)
5. `frontend/index.html` — pricing badge dark mode contrast insufficient (DQ-309)
6. `frontend/agents.html` — recommended badge uses `var(--bg)` which flips in dark mode making badge invisible (DQ-286)

## Fix

Add `[data-theme="dark"]` overrides for each element. For webkit-autofill:
```css
[data-theme="dark"] input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px var(--bg-card) inset;
  -webkit-text-fill-color: var(--ink);
}
```

## Files

- `frontend/pricing.html` — trial banner, promo cards
- `frontend/app.js:900-908` — auth inputs (or styles.css for CSS)
- `frontend/seasonpace.html` — milestone badges
- `frontend/index.html` — pricing badge
- `frontend/agents.html` — recommended badge

## Acceptance Criteria

- All 6 elements are readable in dark mode
- Autofill inputs match Razzle dark theme
- No badge or banner becomes invisible when toggling dark mode
