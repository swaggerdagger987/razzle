# QA + UX Audit — Phases 71-75

**Date**: 2026-03-10
**Scope**: aging.html, weekly.html, targets.html, live_data.py, server.py
**Pages audited**: 3 new pages (Aging Curves, Weekly Scoring Heatmap, Target Distribution)

---

## QA FINDINGS

### HIGH

**Q1. aging.html:555 — escapeHtml then unescape on canvas text**
Canvas `fillText()` takes plain text, not HTML. Calling `escapeHtml()` then immediately un-escaping with `.replace()` chains is pointless and a code smell. Use plain text directly for canvas rendering.

**Q2. weekly.html + targets.html — fetch() missing resp.ok check**
Both pages call `.then(r => r.json())` without checking `r.ok`. A 404/500 response will try to parse HTML as JSON and fail silently or show misleading error.

**Q3. weekly.html + targets.html — missing app.js script tag**
Both new pages lack `<script src="app.js"></script>`. The Ctrl+K quick search command palette does not work on these pages, breaking a platform-wide feature. aging.html has it (line 762).

**Q4. targets.html — carries mode does not re-sort players by carries**
When toggling from Targets to Carries, players remain sorted by `targets + carries` combined. RBs (who dominate carries) are buried below WRs. The active mode should sort by the relevant metric.

**Q5. aging.html:554 — player name truncation too aggressive**
Top player labels truncate at 12 chars ("Jonathan Tay."). For fantasy players who know these names, this is unhelpful. Use last name only for cleaner labels.

### MEDIUM

**Q6. No resp.ok check in aging.html fetch either** — same pattern as Q2.

**Q7. Position/mode tabs lack aria-labels** — all three pages have filter buttons without `aria-label` attributes for screen readers.

**Q8. aging.html "peak season" label misleading** — summary cards say "peak season" but show peak age.

**Q9. weekly.html heat legend shows no numeric thresholds** — user cannot tell what score counts as "hot" vs "cold."

**Q10. targets.html small bar segments lack visible labels** — segments <8% width have no text, rely on slow browser title tooltip.

**Q11. server.py — no try/except on 3 new endpoints** — aging-curves, weekly-heatmap, target-distribution endpoints have no error handling. Database errors return raw 500 tracebacks.

**Q12. live_data.py — fetch_aging_curves uses hardcoded position list** — uses `("QB", "RB", "WR", "TE")` instead of the `FANTASY_POSITIONS` constant.

### LOW

**Q13. Inconsistent loading messages** — "studying the tape..." vs "studying the film..." are near-identical.

**Q14. weekly.html cell hover scale(1.1) feels odd** — numbers shouldn't grow on hover in a data table.

**Q15. targets.html "car" abbreviation** — "rush" or "att" more standard than "car" in fantasy.

**Q16. Random dot jitter in aging curves** — non-deterministic rendering across page loads.

---

## UX FINDINGS

### HIGH

**U1. Nav overflow at 14 links** — the topnav now has 14 items. On screens under 1400px this will wrap or overflow. Needs a responsive strategy (e.g., hamburger menu or grouped dropdown).

**U2. Weekly heatmap has no sorting** — users cannot sort by consistency, ceiling, or floor. For a dynasty player evaluating floor vs ceiling, this is a major gap.

### MEDIUM

**U3. Default "All Teams" view on targets page** — 32 team cards in a vertical scroll with no ranking or hierarchy. Overwhelming for new visitors.

**U4. Weekly heatmap has no games played column** — no context for how many weeks a player missed.

**U5. Aging curves — no explanation that curve = all-time while dots = selected season** — only the legend explains this, easy to miss.

**U6. No cross-linking between related dashboards** — aging, weekly, and targets are complementary tools but don't link to each other.

**U7. No error recovery on failed loads** — all three pages show a single error line with no retry button.

### LOW

**U8. Aging curves — no "sell window" annotation after peak** — dynasty players think in these terms.

**U9. Footer link list is 13+ items** — becoming unwieldy on narrow viewports.

**U10. Team dropdown shows abbreviations only** — full team names would be more scannable.

---

## SUMMARY

| Severity | QA | UX | Total |
|----------|----|----|-------|
| HIGH     | 5  | 2  | 7     |
| MEDIUM   | 7  | 5  | 12    |
| LOW      | 4  | 3  | 7     |
