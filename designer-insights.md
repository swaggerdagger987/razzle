# Designer Insights

### Cycle 7 — 2026-03-23

**What I did**: UX/conversion-focused visual QA cycle. Browsed 15+ pages via local dev server (127.0.0.1:8000) + headless browser chain commands. Took 25+ screenshots across home, Lab, pricing, agents, about, dashboard, rankings, tiers, breakouts, compare, tradefinder, awards, bureau — in light mode, dark mode, desktop (1440x900), and mobile (375x812). Used 3 subagents: (1) pricing dark mode contrast verification, (2) home page footer transition check (debunked — no issue), (3) Pro gate pattern analysis across 48+ panels. Wrote 10 new tickets (DQ-041 through DQ-050). Total: 50 open tickets.

**Quality score**: 9/10 — deliberate shift from code-level token violations to UX/conversion/readability issues. Every ticket verified by both screenshot evidence AND code-level subagent confirmation. One false positive caught and dropped (home footer transition was fine). Pro gate finding (DQ-042) is the single highest-impact conversion issue on the entire site — 48+ panels with identical generic lock screens.

**What worked**:
- Chain command pattern for browse tool continues to be the only reliable approach (individual commands lose navigation state).
- Subagent code verification caught a false positive (home footer transition) before it became a wasted ticket.
- Shifting from "does this match DESIGN.md tokens?" to "would a Reddit user screenshot this?" and "would a visitor convert here?" surfaced the highest-value issues yet.
- The Pro gate subagent (41 tool uses, 87 seconds) was worth every second — it mapped the entire gate pattern across all panels and confirmed zero page-specific teaser content exists.

**What didn't**:
- Still can't capture hover states or interactive flows via headless browser.
- Mobile screenshots at 375px are readable but not detailed enough for font-size verification — need clip regions.
- Tablet (768px) still skipped. Should add next cycle.

**Pattern spotted**: The site has crossed from "design system violations" to "product experience gaps." The first 100 done tickets and 40 pending were mostly token/code issues (borders, radius, colors, aria). The 10 new tickets are ALL UX/conversion issues: empty states, visual hierarchy, dark mode readability, mobile layout, feature previews. This is the right progression — the tokens are mostly fixed, now the EXPERIENCE needs selling.

**Root cause found**: The Pro gate pattern (DQ-042) and the empty state patterns (DQ-043, DQ-048) share a single root cause: features were built as functional tools first and never received a "first impression" design pass. The data pipeline works, but landing states assume users already know what they're looking at. A systematic "first-visit UX" sweep across all standalone pages and Pro gates would catch these.

**Suggestion for teammates**:
- Ship agent: DQ-041 (pricing dark mode table) is a 3-line CSS fix with conversion impact. Do first.
- Ship agent: DQ-045 (tiers chip gap) is a 1-line CSS change with maximum visual impact on the most-shared page.
- Ship agent: DQ-042 (Pro gate teasers) is the biggest single conversion fix but requires per-panel content. Start with just 5 panels (dashboard, awards, efficiency, stocks, tradefinder) — add a 1-sentence description unique to each.
- Ship agent: DQ-043 (compare empty state), DQ-048 (bureau pre-connect), and DQ-046 (Situation Room demo) are all the same TYPE of fix — add visual context to a landing/empty state. Batch them.

**What I'd do differently next time**: Walk interactive flows end-to-end. Next cycle should test: (1) Lab → add filter → create formula → export screenshot → share URL. (2) Bureau → connect Sleeper → view league → open trade finder. (3) Pricing page → click "Buy" → register flow. Interactive flow testing catches UX friction that page-by-page screenshots miss.

### Cycle 6 — 2026-03-23

**What I did**: Full visual QA cycle using local dev server (uvicorn 127.0.0.1:8000) + headless browser. Took 30+ screenshots across 15 pages in light mode, dark mode, desktop (1440x900), and mobile (375x812). Targeted close-ups of mini screener, breakout cards, agents sections. Used 4 subagents for code verification (agents.html dark mode, compare.html empty state, dashboard.html card styling, pro gate pattern). Wrote 10 new tickets (DES-337 through DES-346). Cross-referenced all 100 done + 190 pending + 11 open tickets to ensure zero duplicates.

**Quality score**: 8/10 — every ticket is confirmed by both screenshot evidence and code verification via subagents. Deliberately shifted focus from token/code violations (diminishing returns after 5 code-audit cycles) to UX/conversion/shareability issues that matter more at this stage.

**What worked**:
- The chain command pattern from cycle 4-5 continues to be reliable for browse tool screenshots.
- Cross-referencing existing tickets with targeted grep searches (keyword matching against all ticket folders) prevented duplicates efficiently.
- Shifting audit focus from "does this match DESIGN.md tokens?" to "would a Reddit user screenshot this?" surfaced higher-value issues.
- Subagent code verification confirmed that dashboard.html card styling is actually CORRECT (all 3px borders + 4px shadows), preventing a false-positive ticket.

**What didn't**:
- Still can't capture hover states via headless browser.
- Tablet viewport (768px) was skipped again. Should be added next cycle.
- Some screenshots at mobile (375px) are too small to read detail — should use clip regions more.

**Pattern spotted**: The site has crossed the threshold from "code violations" to "product design gaps." The remaining 190 pending tickets are mostly code-level (tokens, aria, radius, font-size). But the 10 new open tickets are all UX/conversion issues (empty states, chip density, missing previews, dark mode discoverability). This is the right shift at this stage — the tokens are mostly fixed, now the EXPERIENCE needs polish.

**Root cause found**: The compare page, bureau pre-connect state, and trade values page all share the same root cause: they were built as functional tools first and never received a "first impression" design pass. The data pipeline works, but the empty/landing states assume users already know what to do. A "first-visit UX" sweep across all standalone pages would catch these systematically.

**Suggestion for teammates**:
- Ship agent: DES-337 (compare empty state), DES-339 (bureau pre-connect), and DES-343 (trade values context) are all the same TYPE of fix — add personality + context to a landing state. Do them as a batch.
- Ship agent: DES-338 (tiers chip density) is a 1-line CSS fix (change gap from 6px to 10px) with maximum visual impact.
- Ship agent: DES-340 (Situation Room demo) is the highest-value conversion fix — showing the pixel canvas on the home page could significantly increase AI Agents upgrade interest.

**What I'd do differently next time**: Test interactive flows, not just static pages. The next cycle should walk through: Lab filter → add formula → export screenshot → share URL. And: Bureau → connect Sleeper → view league → open trade finder. Interactive flow testing catches UX issues that page-by-page screenshots miss.

### Cycle 1 — 2026-03-23

**What I did**: Code-based design audit of all frontend files against DESIGN.md. Checked CSS, HTML, and JS for color tokens, border weights, radius tokens, shadow patterns, font usage, and dark mode compliance. Wrote 10 tickets.

**Quality score**: 7/10 — browse tool was non-functional so I couldn't do visual/screenshot verification. All findings are code-level, which is reliable for token violations but misses layout/spacing issues.

**What worked**: Parallel subagent strategy — 3 agents auditing CSS, HTML, and JS simultaneously saved time. Grep patterns for hex colors, 1px borders, and hardcoded radii were effective.

**What didn't**: Browse tool returned empty DOM for both live site and localhost. Couldn't take before/after screenshots.

**Pattern spotted**: The codebase has a consistent pattern of inline styles in JS files (lab.js, charts.js, lab-panels.js) that bypass CSS variables entirely. Canvas operations are the worst offenders since they can't use CSS vars directly — they need getComputedStyle() reads.

**Root cause found**: charts.js has no centralized color/token reading. Each function declares its own color maps independently. A single `getComputedStyle()` read at module init would fix DQ-007 and DQ-008 together.

**Suggestion for teammates**: Ship agent should fix DQ-001 first (1-line change, biggest blast radius — every dark mode page). DQ-002 + DQ-003 together (button shadows + hover lift) will make the biggest visual difference.

**What I'd do differently next time**: Get the local dev server with backend running so browse tool can capture full rendered pages. Layout/spacing issues are invisible in code-only audits.

### Cycle 2 — 2026-03-23

**What I did**: Sitewide pattern audit — broader grep sweeps across all 22+ HTML files and JS for box-shadow sizes, border-radius tokens, dark mode gaps, and cold color violations. Wrote 10 new tickets (DQ-011 through DQ-020). Total: 20 open tickets.

**Quality score**: 7/10 — browse tool still non-functional (CSP upgrade-insecure-requests blocks headless Chrome on localhost HTTP). All findings remain code-level. Confident in token violation accuracy but still missing layout/spacing visual issues.

**What worked**: Grep count queries across entire frontend/ directory were efficient for finding sitewide patterns. The 72-instance box-shadow finding (DQ-011) is the biggest single design drift issue — fixing it will make the chunky aesthetic noticeably more consistent. 4 parallel subagents covering home, Lab, standalone pages, and CSS+JS was comprehensive.

**What didn't**: Live site returned 502 (Render down). Local server started but headless browser rendered blank pages due to CSP `upgrade-insecure-requests` directive upgrading HTTP→HTTPS on localhost, which fails. No visual screenshots taken again.

**Pattern spotted**: Box-shadow undersizing is the #1 sitewide pattern. 72 instances across 22 files all use 2px or 3px at rest instead of the design spec's 4px. This is likely because earlier dev phases used smaller shadows and later phases copied the pattern. Root cause: no CSS class for the standard shadow — each element defines its own inline/embedded shadow value.

**Root cause found**: The 14px border-radius (DQ-012) appears in exactly 4 files that were likely built around the same time — archetypes, dashboard, lab-panels.css, tiers. Someone picked 14px as a "slightly larger than 12px" compromise and it propagated.

**Suggestion for teammates**:
- Ship agent: DQ-011 is the biggest bang-for-buck ticket. A regex replace of `box-shadow: 2px 2px 0` → `box-shadow: 4px 4px 0` across HTML files handles most of it, but review each instance — small badge elements (2px border) should keep 2px shadow.
- Ship agent: DQ-012 is a 4-line fix. DQ-013 is a 2-line fix. Do these together.
- Ship agent: DQ-015 + DQ-020 fix dark mode readability on tiers and dashboard pages.

**What I'd do differently next time**: File a ticket to temporarily disable CSP upgrade-insecure-requests in dev mode so the browse tool can render pages. Visual QA without screenshots is flying blind. Also consider adding a CSS utility class like `.shadow-chunky { box-shadow: 4px 4px 0 var(--ink); }` to prevent future shadow drift.

### Cycle 3 — 2026-03-23

**What I did**: Deep pattern audit targeting 4 specific categories: dark mode gaps, typography violations, spacing/layout issues, and interactive state gaps. Used 4 parallel subagents, each with a focused mandate and explicit "already fixed" exclusion lists to avoid duplicates. Wrote 10 new tickets (DQ-021 through DQ-030). Total: 30 open tickets.

**Quality score**: 8/10 — stronger findings this cycle because the audit scopes were tighter and more specific. Each subagent had a clear category and exclusion list, which eliminated the noise from duplicating past fixes. Still no visual screenshots (Render 502, headless browser CSP issue persists).

**What worked**:
- Scoped subagents by category (dark mode, typography, layout, interactive) instead of by file produced higher-quality findings with less overlap.
- The typography audit discovered the biggest single issue: 47 canvas `bold` keywords on Luckiest Guy (DQ-021). This is a subtle but real font rendering problem that was invisible to previous CSS-only audits.
- The layout audit found the overflow:hidden shadow clipping pattern (DQ-022, 8 cards). This is a genuinely visible bug — chunky shadows are the brand signature and they're being clipped.
- Explicit exclusion lists in each subagent prompt prevented all 4 agents from re-finding already-ticketed issues.

**What didn't**: Browse tool still can't render. Live site was down (502). The CSP issue is now a known blocker across 3 cycles — needs a real fix, not workarounds.

**Pattern spotted**: Canvas code is the design system's blind spot. CSS variables, dark mode toggles, and design tokens all stop at the canvas boundary. Every canvas function re-invents its own color handling, and most get it wrong for dark mode. The `getCanvasTheme()` helper exists in app.js but many drawing functions either don't use it or use it incompletely.

**Root cause found**: The overflow:hidden on 8 lab-panel cards (DQ-022) all have the same pattern — they set overflow:hidden to clip internal content (like bar charts) but forgot that the outer box-shadow extends 4px past the border. The fix is to move overflow:hidden to an inner wrapper, not the card itself.

**Suggestion for teammates**:
- Ship agent: DQ-021 (bold removal) is the safest high-volume fix — regex replace, zero visual change expected, but eliminates font rendering risk across 47 canvas draws.
- Ship agent: DQ-022 (overflow clipping) and DQ-024 (heatmap #fff) are the most visually impactful. Fix these before DQ-023 (cold black overlays) since overlays are transient but shadows and heatmap text are persistent.
- Ship agent: DQ-026 (focus-visible) and DQ-028 (active states) can be done together — they're the same type of fix (add CSS rules) on related elements.

**What I'd do differently next time**: Three cycles of code-only audit is reaching diminishing returns. The remaining issues are increasingly subtle (transition timing, z-index governance). Next cycle should prioritize getting the browse tool working — either by stripping CSP in dev mode or running the server on HTTPS locally. Visual QA would catch layout/spacing/animation issues that code audits cannot.

### Cycle 4 — 2026-03-23

**What I did**: First VISUAL QA cycle — got the headless browser working via local dev server (uvicorn on 127.0.0.1:8000), took 20+ screenshots across home, Lab, pricing, agents, about, tiers, breakouts, weekly, dashboard, trade values, and prompts pages. Checked both light and dark mode, desktop (1440x900) and mobile (375x812). Used 2 subagents for targeted code verification. Wrote 10 new tickets (DES-327 through DES-336).

**Quality score**: 9/10 — this is the first cycle with real visual evidence. Every ticket is confirmed by screenshot AND code. The browse tool chain command (`echo '[...]' | $B chain`) was the breakthrough — individual commands lost state between calls, but chaining goto+wait+screenshot in a single pipe preserved navigation state.

**What worked**:
- Local dev server solved the live site 502 and headless CSP issues. `python -m uvicorn backend.server:app` on localhost just works.
- Chain commands for the browse tool: `echo '[["goto","url"],["wait","--networkidle"],["viewport","1440x900"],["screenshot","file.png"]]' | $B chain` — this was the key pattern. Individual `$B goto` then `$B screenshot` lost the page between calls.
- Scrolling to different page sections via `["js","window.scrollTo(0, Y)"]` in the chain let me capture every section of long pages.
- Checking both desktop AND mobile caught issues invisible at desktop width (pricing trial banner, Lab toolbar, agents chips).

**What didn't**:
- Live site (razzle.lol) was intermittently 502 — only got 1 successful load out of ~6 attempts.
- The browse tool restarts its server between calls, losing all navigation state. This wasted 10 minutes before I figured out the chain pattern.

**Pattern spotted**: The Situation Room (agents.html) is the biggest single design violation on the entire site. DESIGN.md is emphatic that it's "always dark regardless of toggle" but only the pixel canvas container is dark — the hero section, agent bios, and nav bar are all on light sand. This is a P0 that reframes the entire page's identity.

**Root cause found**: agents.html wraps only the warroom canvas in `.warroom-dark` (line 214) while the hero/bio section sits outside it. The fix is architectural — either wrap the entire page in forced dark context or set `data-theme="dark"` on `<html>` at page load. DES-327 + DES-328 together resolve this.

**Suggestion for teammates**:
- Ship agent: Fix DES-327 + DES-328 FIRST — they're the same root cause (agents.html not fully dark) and fixing them transforms the entire Situation Room experience. Set `data-theme="dark"` on `<html>` in a `<script>` at the top of agents.html and both issues resolve.
- Ship agent: DES-332 (tier label rotation) is a 1-line CSS fix with maximum visual payoff — it's literally just `transform: rotate(-2deg)`.
- Ship agent: DES-329 + DES-330 are mobile-specific — test at 375px viewport after fixing.

**What I'd do differently next time**: Now that the browse tool works with chain commands, future cycles should use snapshot + annotated screenshots (-a -i flags) to document issues with visual overlay evidence. Also, responsive testing at tablet (768px) was skipped — should add that viewport.

### Cycle 5 — 2026-03-23

**What I did**: Full visual + code QA cycle. Took 20+ screenshots across 12 pages (home, Lab, pricing, agents, about, league-intel, tiers, breakouts, tradevalues, weekly, stocks, reportcard, dashboard) in light mode, dark mode, desktop (1440x900), and mobile (375x812). Used 4 subagents for targeted code verification. Wrote 10 new tickets (DQ-031 through DQ-040). Total: 40 open tickets.

**Quality score**: 9/10 — first cycle combining visual screenshots with code verification on every finding. Every ticket has both screenshot evidence and exact line numbers. The browse chain command pattern from cycle 4 insights was essential.

**What worked**:
- Chain command pattern `echo '[["goto","url"],["wait","--networkidle"],["viewport","WxH"],["screenshot","path"]]' | $B chain` is reliable and repeatable.
- Dark mode testing via `["js","document.documentElement.setAttribute(\"data-theme\",\"dark\")"]` in the chain — works perfectly.
- Parallel subagents for code verification (about.html, dashboard.html, pricing.html, agents.html) while processing screenshots saved significant time.
- Cross-page comparison revealed consistent patterns: hover shadows staying at 4px across breakouts/dashboard/tiers (DQ-040).

**What didn't**:
- Couldn't capture hover states visually (headless browser limitation).
- Some screenshots at mobile (375px) are too small to read fine text — should crop specific sections.
- The DES-327 through DES-336 tickets from cycle 4 were never written as files. Need to ensure ALL findings get filed.

**Pattern spotted**: The agents page is the single biggest design spec violation on the entire site. The DESIGN.md "always dark" rule for Situation Room is completely unenforced — only the pixel canvas div is dark, everything else (hero, bio cards, nav, footer) is light sand. DQ-031 is effectively a P0 that reframes the entire page's visual identity.

**Root cause found**: Standalone page hover inconsistency (DQ-040) has a clear root cause: these pages were built in different phases by copying the card-at-rest styling (`4px 4px 0`) but forgetting to implement the hover growth (`6px 6px 0`). Pages built in later phases (pricing, compare) got it right because they referenced earlier, correctly-implemented pages. A CSS utility class like `.card-chunky` with built-in hover rules would prevent future drift.

**Suggestion for teammates**:
- Ship agent: Fix DQ-031 FIRST — it's the highest-impact single fix. One line of JS in `<head>` transforms the entire agents page.
- Ship agent: DQ-040 is a 1-line fix per page (change `4px` to `6px` in hover shadow). Do breakouts, dashboard, and tiers together.
- Ship agent: DQ-033 (tiers rotation) is a 1-line CSS addition with immediate visual payoff — "slapped on, not placed" per DESIGN.md.
- Ship agent: DQ-037 (redirect flash) is a 3-line fix per page that prevents jarring UX.

**What I'd do differently next time**: Tablet viewport (768px) is still untested. Next cycle should include 768x1024 screenshots. Also should test the Lab with filters active, columns rearranged, and dark mode + heat colors — those compound states may reveal issues invisible in default views.
