---
id: S3-085
severity: S3
confidence: MEDIUM
category: ux-polish
source: DQ-194+221+235+239+242+243+245+254+264+274+293+296+302+305+314+316
status: OPEN
---

# Miscellaneous UX polish batch — 16 low-priority copy, layout, and interaction items

## Root Cause

Collection of low-priority UX findings that individually are minor but collectively impact polish:

1. **Home bureau copy lowercase** — `frontend/index.html`: "Bureau of Intelligence" section copy starts with lowercase (DQ-194)
2. **Duplicate leaguemates copy** — `frontend/index.html`: leaguemates section has redundant text (DQ-221)
3. **About page missing Twitter handle** — `frontend/about.html`: contact section doesn't include @razzle_lol (DQ-235)
4. **Console easter egg year cap 2025** — `frontend/app.js`: console ASCII art references 2025 instead of dynamic year (DQ-239)
5. **Footer no Twitter link** — sitewide: footer lacks link to @razzle_lol Twitter (DQ-242)
6. **Warroom hardcoded 2025 prompts** — `frontend/warroom.js:1652`: sample prompts reference 2025 (DQ-243, also in S2-094)
7. **Easter eggs only on pricing** — `frontend/pricing.html`: promo code easter eggs limited to one page (DQ-245)
8. **Zero support contact email** — sitewide: no support email address anywhere (DQ-254)
9. **About page no email contact** — `frontend/about.html`: no email for contact (DQ-264)
10. **Demo briefing stale player names** — `frontend/`: demo content references players who may have retired/moved (DQ-274)
11. **No preseason data warning** — sitewide: no indicator when viewing stale offseason data (DQ-293)
12. **Demo league stale year 2024** — `frontend/`: demo data references 2024 season (DQ-296)
13. **Badge emojis double-announced** — `frontend/agents.html`: screen reader announces emoji AND text for agent badges (DQ-302)
14. **API key input type=password** — `frontend/warroom.js`: API key input is type=password, can't verify pasted key (DQ-305)
15. **Footer tagline fragile injection** — `frontend/app.js`: footer personality text injected by DOM walking (DQ-314)
16. **Warroom demo ??? placeholders** — `frontend/warroom.js`: demo briefings show ??? as placeholder text (DQ-316)

## Fix

Each is an independent micro-fix. Prioritize stale year references (DQ-239, 243, 296) and missing contact info (DQ-254, 264).

## Files

- `frontend/index.html` — copy fixes
- `frontend/about.html` — contact info
- `frontend/app.js` — year references, footer injection
- `frontend/warroom.js` — demo content, API key input
- `frontend/agents.html` — badge ARIA
- `frontend/pricing.html` — easter eggs

## Acceptance Criteria

- No hardcoded year references in user-facing content
- Contact/support info available
- Demo content current and not showing placeholder text
