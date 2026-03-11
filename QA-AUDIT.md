# QA + UX Audit — Phases 46-49

**Audit Date**: 2026-03-10
**Phases Covered**: 46 (Dynasty Sparkline), 47 (Gray Color Fixes), 48 (Screener Sparklines), 49 (Hover Cards)

---

## QA FINDINGS

### CRITICAL

**Q1: No input type validation for player_ids in sparklines endpoint**
- File: `backend/server.py` line 498 + `backend/live_data/players.py` line 468
- Issue: `player_ids = body.get("player_ids", [])` accepts any type (string, number, dict) without validation. A string input causes silent slicing (`"abc"[:200]` = `"abc"`), mismatched SQL placeholders, and a crash.
- Fix: Add `if not isinstance(player_ids, list): return {"sparklines": {}}` at the top of `fetch_screener_sparklines()`.

### HIGH

**Q2: No type validation for season parameter**
- File: `backend/server.py` line 499
- Issue: `season = body.get("season", 0)` accepts string/float. A string season like `"2024"` may cause cache key or SQL type affinity issues.
- Fix: Add `season = int(season) if isinstance(season, (int, float)) else 0` with try/except.

**Q3: Unescaped position in hover card HTML**
- File: `frontend/lab.js` showHoverCard function
- Issue: `${pos}` in hover card pos-badge is not escaped with `escapeHtml()`. While positions are controlled (QB/RB/WR/TE), this violates the established escaping pattern used on lines 911, 922, 930.
- Fix: Replace `${pos}` with `${escapeHtml(pos)}` in hover card.

### MEDIUM

**M1: Cache key crashes with mixed types in player_ids list**
- File: `backend/live_data/players.py` fetch_screener_sparklines
- Issue: `sorted(ids)` crashes if list contains mixed int + string types. While frontend sends strings, a malformed API call could trigger this.
- Fix: Coerce all IDs to strings: `ids = [str(pid) for pid in player_ids[:200]]`.

**M2: Hover card pointer-events:none prevents reading the card**
- File: `frontend/lab.html` .hover-card CSS
- Issue: `pointer-events: none` means the card disappears as soon as the cursor leaves the player name link. Users can't hover over the card itself to keep reading.
- Fix: Change to `pointer-events: auto` and add onmouseenter/onmouseleave on the card itself to keep it visible while the cursor is over it.

### LOW

**L1: Sparkline has no scale indicator**
- File: `frontend/lab.js` buildSparklineSVG function
- Issue: The sparkline shows relative shape but no indication of absolute values. A 5 PPG player and a 25 PPG player look the same if their trend is similar.
- Note: Acceptable for now — sparklines are for trend direction, not absolute comparison.

**L2: Missing alt text for hover card headshot**
- File: `frontend/lab.js` showHoverCard function
- Issue: Headshot image has `alt=""` — not descriptive for screen readers.
- Fix: Use descriptive alt text with player name.

---

## UX FINDINGS

### HIGH

**U1: Sparkline column adds horizontal width to already-wide PPR preset**
- Impact: Default PPR preset now has 14 columns including 80px sparkline. On 1366px screens, stat columns get pushed off-screen.
- Fix: Remove "trend" from PPR preset default (keep in Dynasty only). Users add via column picker.

### MEDIUM

**U2: No visual hint that player names have hover cards**
- Impact: First-time users won't discover hover cards unless they accidentally hover. The dashed underline suggests clickability but not hoverable info cards.
- Note: Low priority — users will discover organically. Current UX is acceptable.

### LOW

**U3: Sparkline placeholder loading state is noisy**
- Impact: Repeating gradient placeholder draws attention before sparkline data loads.
- Fix: Use simpler placeholder (faint dash or nothing).

---

## DESIGN SYSTEM COMPLIANCE

- Phase 47 gray replacements: PASS — no hardcoded grays in non-warroom frontend files
- Sparkline CSS: PASS — uses var(--ink-faint), var(--green), var(--orange)
- Hover card CSS: PASS — var(--bg-card), 3px solid var(--ink), 4px 4px 0 shadow, 12px radius
- Fonts: PASS — var(--font-display), var(--font-mono)
- Mobile: PASS — hover card hidden at 768px, sparkline toggleable
