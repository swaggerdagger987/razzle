---
id: DQ-184
priority: P2
category: css-architecture/inline-styles
status: open
cycle: 27
---

# league-intel.html Monte Carlo selects — massive inline styles instead of `.select-chunky`

## What's wrong

The Monte Carlo simulation scenario builder in league-intel.html renders 3 `<select>` elements with massive inline styles instead of using the existing `.select-chunky` CSS class. This means:
- Dark mode can't override them via CSS
- The visual doesn't match other selects across the site
- Any future style changes to selects require editing JS code

## Where

| Line | Element | Current inline style |
|------|---------|---------------------|
| 6420 | `#mc-injury-sel-{id}` | `font-family:var(--font-mono);font-size:11px;padding:3px 6px;border:2px solid var(--ink);border-radius:8px;background:var(--bg-card);` |
| 6446 | `#mc-trade-a-{id}` | Same pattern + `max-width:180px` |
| 6453 | `#mc-trade-b-{id}` | Same pattern + `max-width:180px` |

## Fix

Replace inline styles with the `.select-chunky` class (already defined in `styles.css`):
```javascript
// Before
html += '<select id="mc-injury-sel-' + leagueId + '" style="font-family:var(--font-mono);font-size:11px;...">';

// After
html += '<select id="mc-injury-sel-' + leagueId + '" class="select-chunky" style="font-size:11px;max-width:180px;">';
```

Only keep `font-size` and `max-width` as inline overrides if they differ from `.select-chunky` defaults.

## Test

1. Connect a Sleeper account, open a league.
2. Scroll to Monte Carlo section, run a scenario.
3. Injury and trade selects should match the Lab's select styling.
4. Toggle dark mode — selects should invert correctly.
