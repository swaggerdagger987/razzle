---
id: S3-028
severity: S3
category: brand-voice
finding_ref: EDGE-53,EDGE-54
confidence: HIGH
---

# S3-028: Toast messages are functional, not brand-voiced — missing micro-celebrations

## Root Cause

`frontend/lab.js:82`:
```javascript
_showToast('CSV exported');
```

`frontend/lab.js:154`:
```javascript
_showToast('screenshot saved');
```

Watchlist add (`lab.js:254-272`) — no toast at all on successful add.

Toast messages throughout the Lab use functional language ("CSV exported", "screenshot saved",
"copied to clipboard") instead of Razzle's brand voice. No celebratory feedback on key
user actions like watchlist add, formula save, or screenshot capture.

Trial start at `app.js:871` DOES have confetti — so the pattern exists, just not applied
to other actions.

## What to Fix

Replace functional toasts with brand-voiced copy:

| Action | Current | Replacement |
|--------|---------|-------------|
| CSV export | "CSV exported" | "tape's in your hands" |
| Screenshot | "screenshot saved" | "film captured — share it" |
| Watchlist add | (none) | "on the board" |
| Watchlist remove | (none) | "off the board" |
| Formula save | "Formula saved" | "formula locked in" |
| Copy URL | "Copied to clipboard" | "link copied — send it" |

## Files to Change

- `frontend/lab.js` — Update toast messages at lines 82, 154, 254-272
- `frontend/formulas.js` — Update formula save toast if applicable

## Acceptance Criteria

- [ ] All user-facing toasts use Razzle's casual brand voice
- [ ] Watchlist add/remove shows a toast
- [ ] No toast text uses generic terms like "exported", "saved", "copied"

## Do NOT

- Do not add confetti to every action (reserve for milestone moments)
- Do not change error toasts — those should stay clear and informative
