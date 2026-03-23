# DQ-105: Zero overflow-wrap / word-break rules — long strings can break layout

**Priority**: P3
**Category**: Layout safety
**Severity**: Low — edge case but can cause visible overflow
**Evidence**: Code search — zero instances of `word-break`, `overflow-wrap`, or `word-wrap` in any frontend CSS or HTML file

## What's wrong

No CSS rules exist to handle long unbreakable strings. While most player names are short enough to be handled by `text-overflow: ellipsis`, several content types can contain arbitrarily long strings:

1. **Formula expressions**: User-created formulas like `(pass_td * 4 + rush_td * 6 + rec_td * 6 + receptions * 0.5)` displayed in formula cells
2. **League names**: Sleeper league names are user-defined and can be very long
3. **Player notes**: 140-char user annotations (no word-break means a single long word overflows)
4. **URLs**: Share links displayed in UI

Without `overflow-wrap: break-word`, these strings push past their container boundaries.

## Where

- `frontend/styles.css` — zero rules
- Affects: formula builder cells, league name displays, player note overlays, share URL displays

## Fix

Add to `frontend/styles.css` base rules:

```css
.formula-cell, .formula-expression,
.league-name, .player-note,
.share-url, .error-message {
  overflow-wrap: break-word;
  word-break: break-word;
}
```

Or apply globally to all card body content:
```css
.card-body, .panel-content { overflow-wrap: break-word; }
```

## Verification

Create a formula with a very long expression. It should wrap within its cell, not overflow horizontally.
