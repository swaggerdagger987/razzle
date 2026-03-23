# Designer Insights

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
