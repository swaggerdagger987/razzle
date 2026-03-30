# DQ-109: Home page tablet (768px) — Situation Room demo section layout issues

**Priority**: P2
**Category**: Responsive layout
**Severity**: Medium — key conversion section looks broken at tablet width
**Evidence**: Visual — screenshot of index.html at 768x1024 viewport

## What's wrong

At tablet width (768px), the "DO AI AGENTS THAT ALREADY KNOW YOUR LEAGUE" section on the home page has layout problems:

1. The dark Situation Room demo container appears to have awkward proportions — the pixel canvas may not be scaling proportionally within the narrower container
2. The agent briefing cards below the canvas demo are likely cramped or overflowing their container at this width
3. The section title text wraps in an unnatural way

This section is a key part of the conversion funnel (Free → Agents → Pro). If it looks broken at tablet width, it hurts conversion for iPad users.

## Where

- `frontend/index.html` — Situation Room demo section (the dark-background section with pixel canvas preview)
- CSS in `frontend/styles.css` — likely missing a `@media (max-width: 768px)` rule for this section

## Fix

1. Add responsive rules for the demo container at 768px: `max-width: 100%; overflow: hidden`
2. Scale the pixel canvas preview proportionally within narrower container
3. Ensure agent briefing text doesn't overflow at tablet widths
4. Check the section heading wraps at a natural word boundary

## Verification

Open index.html at 768px width. The Situation Room demo section should look intentional — canvas centered, text readable, no overflow.
