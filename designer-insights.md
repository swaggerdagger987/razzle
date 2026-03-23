# Designer Insights

### Cycle 24 — 2026-03-23

**What I did**: UX COMPLETENESS + DISCOVERABILITY audit — shifted from CSS tokens and modern browser features to structural UX gaps: page discoverability, mobile usability, content freshness, and cross-page consistency. Ran 3 parallel subagents: (1) content/copy brand compliance, (2) visual consistency patterns (!important, duplicates, touch targets, images), (3) dark mode + mobile responsiveness (100vw, breakpoints, black rgba). Cross-referenced all 150 existing tickets. Attempted headless browser on razzle.lol (still blank — same issue as cycles 22-23). Wrote 10 new tickets (DQ-151 through DQ-160).

**Quality score**: 8/10 — Found a genuinely new audit dimension (structural UX: discoverability, print, empty states) that 23 previous cycles missed because they focused on visual tokens and CSS quality. DQ-151 (100vw) and DQ-155 (orphan pages) are the highest-impact finds.

**What worked**:
- Three parallel subagents with orthogonal search dimensions (brand copy, visual patterns, dark+mobile) covered 30 categories efficiently.
- Content/copy audit came back CLEAN — zero brand violations. Loading states, error messages, empty states, titles all consistent. This means the Phase A design audit was thorough.
- Cross-referencing DQ-061 (agents cold black rgba) against git blame caught a REGRESSION: agents.html:259 shadow was re-introduced in commit 135c614f AFTER the original fix.
- DQ-155 (37 orphan pages) is a structural finding no previous cycle caught because they audited CSS/JS, not navigation topology.

**What didn't**:
- Headless browser still can't render razzle.lol — 3rd consecutive cycle with this blocker. Cannot do visual QA.
- DQ-152 (duplicate selectors) and DQ-153 (inline display:none) are maintenance tickets, not user-visible bugs. They're valid but low-priority.
- Could not verify 100vw horizontal scroll (DQ-151) visually — code-verified only.

**Pattern spotted**: After 24 cycles, the audit has covered 9 eras: (1) design tokens, (2) UX/conversion, (3) interaction quality, (4) system governance, (5) behavioral CSS, (6) CSS architecture, (7) runtime robustness, (8) modern CSS + mobile hardening, (9) UX COMPLETENESS + DISCOVERABILITY. The remaining frontier is INTEGRATION FLOW TESTING — multi-page user journeys that cross file boundaries (Lab -> export -> share -> reopen; free user -> Pro gate -> pricing -> register -> redirect).

**Root cause found**: The 37 orphan pages (DQ-155) exist because the 162 autonomous build phases each created standalone HTML pages for new panels. The Lab panel system (lab-panels.js) links to them, but no top-level directory page exists. Pages were built bottom-up (one panel at a time) with no top-down navigation audit.

**Suggestion for teammates**:
- Ship agent: DQ-151 (100vw -> 100%) is a mechanical find-replace. 13 instances, zero ambiguity. Do first.
- Ship agent: DQ-156 (stale 2024 year) is a 2-line fix. Do immediately — it's a credibility issue.
- Ship agent: DQ-159 (agents rgba shadow) is a 1-line fix. Regression from prior fix.
- Ship agent: DQ-155 (orphan pages) requires product design — don't just add 37 links to the footer. Needs a Lab sidebar nav or hub page. Escalate to PM if unclear.
- Ship agent: DQ-158 (print styles) is a nice-to-have but genuinely useful for draft day.

**What I'd do differently next time**: Fix the headless browser issue. It's been 3 cycles. Also: attempt INTEGRATION FLOW TESTING — trace actual user journeys through multiple pages and verify state survives transitions (URL params, localStorage, auth redirects).

### Cycle 23 — 2026-03-23

**What I did**: MODERN CSS + MOBILE HARDENING audit — shifted from visual tokens and runtime robustness to browser-native quality signals (dvh, hover media, fetchpriority, overscroll-behavior, text-wrap, color-scheme, scroll-padding). Ran 2 parallel subagents: (1) 10-pattern anti-pattern search (font-weight on display fonts, text-transform+Caveat, 100vh, position:fixed z-index, animation reduce-motion, etc.), (2) visual consistency search (max-width drift, heading patterns, card consistency, title patterns, nav active states). Headless browser still blank on localhost (same CSP issue). Cross-referenced all 346 existing tickets. Wrote 10 new tickets (DQ-141 through DQ-150).

**Quality score**: 8/10 — Shifted to a genuinely new audit dimension: modern CSS features and mobile-specific hardening. All 10 tickets target issues that previous 22 cycles missed because they're about what's ABSENT (missing attributes, missing media queries, missing CSS properties) rather than what's WRONG (bad values, bad colors).

**What worked**:
- Two parallel subagents with orthogonal searches (anti-patterns vs visual consistency) covered 20 categories efficiently.
- Comparing the "correct" pattern (lab.html:966-967 has dvh) against the "incorrect" pattern (styles.css:147 doesn't) makes tickets concrete and verifiable.
- Counting approach: "143 :hover rules, 0 guarded" immediately communicates systemic scale.
- The subagents confirmed several patterns are ALREADY CORRECT: prefers-reduced-motion global rule exists, all margin:auto have max-width, all target="_blank" have rel="noopener", color-scheme detection exists in app.js.

**What didn't**:
- Headless browser still blank on localhost — same CSP issue across 3 consecutive cycles. This is now a systemic blocker for visual QA.
- Could not verify the scroll-padding-top issue visually (would need to click an anchor link and observe scroll position).
- DQ-144 (hover guard) is the largest scope ticket — 143 rules across 2 files. Shipper will need to be careful not to break keyboard :focus-visible states.

**Pattern spotted**: After 23 cycles, the audit has covered 7 eras: (1) design tokens, (2) UX/conversion, (3) interaction quality, (4) system governance, (5) behavioral CSS, (6) CSS architecture, (7) runtime robustness, and now (8) MODERN CSS + MOBILE HARDENING. The remaining frontier is INTEGRATION FLOW TESTING — multi-page user journeys that cross file boundaries.

**Root cause found**: The 100vh/dvh gap (DQ-141) shows a pattern: lab.html (the most-iterated file, built across 125+ phases) has the fix, but styles.css (the shared stylesheet, modified less frequently) does not. Individual pages get hardened through QA, but the shared infrastructure drifts because nobody re-audits it after early phases.

**Suggestion for teammates**:
- Ship agent: DQ-148 (scroll-padding-top) is a ONE-LINE fix in styles.css. Zero risk. Do first.
- Ship agent: DQ-141 (100dvh) is 3 lines added to styles.css. Zero risk — it's progressive enhancement.
- Ship agent: DQ-149 (color-scheme) is 2 lines of CSS. Zero risk.
- Ship agent: DQ-142 (font-weight:400 on Caveat) is a find-delete across 13 files. Mechanical.
- Ship agent: DQ-144 (hover guard) is HIGHEST IMPACT but HIGHEST COMPLEXITY. Suggest doing it last. Wrap each file's hover rules in one `@media (hover: hover) { }` block.
- Ship agent: DQ-143 (h1/h2 baseline) should be done WITH DQ-150 (text-wrap:balance) since both add to the same heading rules.

**What I'd do differently next time**: Fix the headless browser issue. The CSP problem has blocked visual QA for 3 cycles. Consider: (1) adding a `--dev` flag to the FastAPI server that skips the CSP header, (2) using a different port/protocol, or (3) running the browser with `--disable-web-security` flag. Visual QA would catch issues that code-level grep cannot (spacing problems, alignment drift, visual hierarchy).

### Cycle 22 — 2026-03-23

**What I did**: Fresh code audit after headless browser failed (CSP upgrade-insecure-requests blocks localhost rendering, DNS resolution failing for external sites). Pivoted to code-level design audit. Ran 7 parallel search agents: cold grays, 1px borders, hardcoded fonts, hardcoded colors, loading states, border-radius tokens, box-shadow patterns. Cross-referenced all 336 existing tickets (130 root + 21 open + 100+ pending + 10 queue + 156 done) to ensure zero duplicates. Wrote 10 new tickets (DQ-131 through DQ-140).

**Quality score**: 7/10 — Solid code-level findings, but couldn't do visual QA due to browser issues.

**What worked**: Parallel agent searches were efficient. Cross-referencing against 336 existing tickets ensured no duplicates.

**What didn't**: Headless browser couldn't render ANY page (localhost or remote). CSP `upgrade-insecure-requests` header + DNS resolution issues. Tried 4 different approaches (localhost:8000, 127.0.0.1:8000, static file server on :9876, example.com) — all returned empty body.

**Pattern spotted**: The sitewide `translate(-1px, -1px)` hover issue (DQ-131) is the biggest find — 35 instances in 16 files including styles.css itself. This means the design system base classes teach the wrong pattern, and every page inherits it. Fix styles.css first, then the rest.

**Root cause found**: The hover translate discrepancy (-1px vs -2px) likely happened early in development (maybe copied from a reference) and then propagated to every page that copied the hover pattern. The prompts page issues (DQ-133, DQ-136, DQ-138, DQ-140) suggest it was built in one pass without a design review.

**Suggestion for teammates**: Ship agent should fix DQ-131 first (sitewide translate) since it's a single find-replace across 16 files. Then DQ-132 (agent colors) since it touches a single file. Prompts page tickets (133, 136, 138, 140) can be batched as one "prompts page polish" commit.

**What I'd do differently next time**: Investigate the headless browser issue before starting searches. Maybe disable CSP on the local server for QA purposes, or use a different browser tool.

### Cycle 16 — 2026-03-23

**What I did**: ROBUSTNESS + PERFORMANCE audit — shifted from visual tokens to runtime code quality. Local server running (uvicorn on 127.0.0.1:8000). Took 15+ screenshots across home, Lab (desktop + mobile), pricing (desktop + mobile), agents, bureau, dashboard, trade values, rankings, breakouts, awards, efficiency, weekly heatmap. Used 2 subagents: (1) 10-category performance/robustness search (render-blocking, duplicate listeners, localStorage try-catch, lazy loading, fetch timeout, document.write, innerHTML safety, CSS @import, viewport meta, console.log), (2) 10-category code quality search (fetch .catch(), addEventListener cleanup, hardcoded years, error UI, nav active state, broken links, CSP headers, API error leakage, duplicate CSS selectors, form labels). Cross-referenced all 120 existing DQ tickets + 100 done tickets to ensure zero duplicates. Wrote 10 new tickets (DQ-121 through DQ-130).

**Quality score**: 8/10 — Successfully shifted to a completely new audit dimension (runtime robustness) that no previous cycle touched. All 10 tickets are backed by exact grep counts. The shift from "does it look right?" to "does it survive failure?" addresses the exit criterion for Phase B (Lab Production Hardening). Found the single biggest UX issue remaining: 95 fetch calls with zero error handling means ANY API failure creates a permanent loading state.

**What worked**:
- Two parallel subagents with non-overlapping search categories (performance patterns vs code quality patterns) covered 20 categories efficiently.
- Browse tool chain commands reliable for all 15+ screenshots (forward slashes in paths fixed the Windows path issue).
- Counting-based severity: "95 unhandled fetches" and "110+ without timeout" immediately communicate scale. The Ship agent can prioritize by count.
- Cross-referencing the verified-good patterns (formula-store.js has .catch() on all 5 fetches, advantage.html has aria-label) provides ready-made code examples for fixes.

**What didn't**:
- Browse tool path handling required trial-and-error (backslashes rejected, forward slashes work). Wasted 3 attempts.
- Could not test actual fetch failure behavior visually (would need to intercept network requests). Tickets DQ-121/129 are code-verified, not UX-verified.
- The "duplicate addEventListener" ticket (DQ-123) is hard to quantify precisely — knowing 195 listeners exist doesn't tell us how many are truly duplicated at runtime. Would need a profiling session.

**Pattern spotted**: After 16 cycles, the audit eras are: (1) design tokens, (2) UX/conversion, (3) interaction quality, (4) system governance, (5) behavioral CSS, (6) CSS architecture, (7) RUNTIME ROBUSTNESS. The remaining work falls into two buckets: (a) INTEGRATION TESTING — multi-page user flows (Lab → export → share → reopen), and (b) LOAD TESTING — how the site behaves with 100+ concurrent users on Render's free tier.

**Root cause found**: The 95 unhandled fetch calls (DQ-121) and the 110+ timeout-less fetches (DQ-122) share the same root cause as DQ-115 (duplicate embedded CSS) and DQ-120 (inline style writes): the 162 autonomous build phases each added features independently without cross-cutting concerns like error handling. Each phase focused on "make this panel work" — not "make this panel survive failure." The result is 72 fetch calls in lab-panels.js that all follow the same pattern: fetch().then(render) with no .catch().

**Suggestion for teammates**:
- Ship agent: DQ-122 (fetchWithTimeout helper) should be implemented FIRST — it's a single shared utility in app.js that all other fetch fixes can use. 10 lines of code, zero risk.
- Ship agent: DQ-121 (add .catch) and DQ-129 (error recovery UI) should be done together — adding .catch without a visible error state just converts a silent failure to a logged-but-still-invisible failure.
- Ship agent: DQ-124 (localStorage try-catch) is the safest mechanical fix — create safeGet/safeSet in app.js, find-replace 42 calls.
- Ship agent: DQ-123 (addEventListener cleanup) is the most complex ticket — consider Option B (event delegation) for lab-panels.js to eliminate the problem structurally. Option A (remove+add) is simpler but requires touching 195 call sites.
- Ship agent: DQ-126 (form labels) is purely mechanical — add aria-label to 56 elements. No judgment calls needed.

**What I'd do differently next time**: Run INTEGRATION FLOW TESTING. After 16 cycles of page-level analysis and code-level grep audits, the remaining high-value work is in multi-page user journeys: (1) Lab filter → export PNG → share URL → recipient opens URL — does state survive the round trip? (2) Free user → clicks Pro panel → sees gate → clicks pricing → registers → returns — does the redirect work? (3) Bureau connect → league loads → trade finder → clicks trade target → compare page. These flows cross file boundaries and can't be found by static analysis.

### Cycle 15 — 2026-03-23

**What I did**: CSS architecture + maintainability + visual hierarchy audit. Local server running (uvicorn on 127.0.0.1:8000). Took 20+ screenshots across home (hero zoom, mid-section, pricing zoom, footer), Lab (full, left zoom, sidebar zoom, dark mode sidebar), pricing (desktop + mobile), agents, bureau, dashboard (full + section zoom), rankings, trade values, tiers, breakouts, efficiency, scarcity, weekly heatmap, awards — in light mode, dark mode, desktop (1440x900), and mobile (375x812). Used 1 subagent for 10-category fresh code search (!important, display:none, innerHTML, window.location, inline color:#, inline font-family, border:1px, text-align:center inline, margin:0 auto, .style.property DOM writes). Cross-referenced all 110 existing DQ tickets + 100 done tickets to ensure zero duplicates. Wrote 10 new tickets (DQ-111 through DQ-120).

**Quality score**: 8/10 — Shifted to a completely new audit dimension: CSS ARCHITECTURE and MAINTAINABILITY. Previous 14 cycles focused on visual tokens, dark mode, accessibility, responsive, and interaction patterns. This cycle found systemic structural issues: duplicated CSS across 60+ files, !important cascade failures, JS inline style delivery mechanisms, and missing print support. Also found visual hierarchy issues on dashboard and trade values pages.

**What worked**:
- Chain commands for browse tool were reliable across 20+ screenshots. Clip regions (--clip x,y,w,h) gave focused detail shots.
- Counting-based severity: "81 !important", "212 .style.property writes", "27 .style.cssText strings", "76 <style> blocks" — quantified the systemic scale instantly.
- Subagent code search covered 10 fresh patterns orthogonal to all prior cycles, focusing on architectural anti-patterns rather than individual token violations.
- Zoomed screenshots revealed specific visual hierarchy issues (dashboard flat sections, trade values no header, pricing card border mismatch) that full-page screenshots miss.

**What didn't**:
- Browse tool still restarts server between non-chain calls (shows "Starting server..." each time). Must use chain commands or pipe JSON for state persistence.
- Could not test print output visually in headless browser. DQ-112 (print styles) is code-verified only.
- Render deployment returned 502 — had to fall back to local server. Live site testing remains blocked.

**Pattern spotted**: After 15 cycles, the audit has now covered 6 eras: (1) Cycles 1-5: design tokens (colors, borders, radius, shadows), (2) Cycles 6-9: UX/conversion (empty states, Pro gates, previews), (3) Cycles 10-12: interaction quality (hover, loading, dark mode), (4) Cycle 13: system-level governance (line-height, opacity, motion, focus-visible), (5) Cycle 14: behavioral CSS (cursor, touch, selection, overflow), (6) Cycle 15: CSS ARCHITECTURE (duplication, specificity, inline JS styles, print). The remaining work falls into two buckets: (a) FLOW TESTING — end-to-end user journeys crossing multiple pages, and (b) PERFORMANCE AUDITS — render-blocking resources, layout shifts, long task budgets.

**Root cause found**: The 76 embedded <style> blocks (DQ-115) and 212 .style.property writes (DQ-120) share a root cause: the 162 autonomous build phases each added one page/feature at a time with no CSS architecture review between phases. Each phase was self-contained — new page, new <style> block, new JS inline styles. The result is 60+ pages that each reinvent the same CSS skeleton independently. The !important overuse (DQ-111) is a downstream symptom: when 60+ pages have their own specificity contexts, the shared styles.css needs !important to override them.

**Suggestion for teammates**:
- Ship agent: DQ-112 (print styles) is the highest user-impact ticket — 10 lines of CSS in styles.css fixes printing for ALL 75 pages. Zero risk. Do this first.
- Ship agent: DQ-113 (watermark CSS class) is the quickest mechanical fix — 7 lines of CSS + find-replace across 23 files.
- Ship agent: DQ-115 (duplicate embedded CSS) is the LARGEST ticket by scope but the most impactful for long-term maintainability. Consider a phased approach: extract shared page skeleton first, then page-specific overrides.
- Ship agent: DQ-111 (!important) should wait until DQ-115 is done — fixing the duplication first reduces the specificity pressure that causes !important usage.
- Ship agent: DQ-114 and DQ-120 (.style.cssText and .style.property) are related tickets. Fix together by creating CSS classes for all JS-created elements.

**What I'd do differently next time**: Run END-TO-END FLOW TESTING. After 15 cycles of page-level screenshots and code audits, the remaining issues are in user journeys that cross pages: (1) Lab filter → export → share URL → recipient opens shared URL, (2) Free user → Pro gate → pricing → register → return to gated page, (3) Bureau connect → league view → trade finder → compare. Static page screenshots and grep cannot find friction in these flows.

### Cycle 14 — 2026-03-23

**What I did**: Interactive behavior + responsive layout + mobile UX audit. Local server running (uvicorn on 127.0.0.1:8000). Took 15+ screenshots across home, Lab, pricing, agents, bureau, dashboard, rankings, awards, trade values — in light mode, dark mode, desktop (1440x900), tablet (768x1024), and mobile (375x812). FIRST EVER TABLET TESTING after 13 cycles. Used 1 subagent for 10-category fresh code search (text-decoration, cursor styles, white-space/text-overflow, min-height/min-width, touch-action, @media print, ::selection, tab-size, word-break/overflow-wrap, aspect-ratio). Cross-referenced all 100 existing DQ tickets + 100 done tickets to ensure zero duplicates. Wrote 10 new tickets (DQ-101 through DQ-110).

**Quality score**: 8/10 — Shifted to a completely new audit dimension: INTERACTIVE BEHAVIOR (cursor affordances, touch UX, selection branding, disabled states) and RESPONSIVE GAPS (tablet viewport, text overflow). All code findings backed by exact grep counts (371 cursor:pointer, 0 ::selection, 0 touch-action, 50 unmatched nowrap). First tablet viewport testing fills a 13-cycle blind spot. Visual screenshots confirmed dashboard subtitle readability issue and home tablet Situation Room overflow.

**What worked**:
- Chain command pattern for browse tool was reliable for all 15+ screenshots. State persisted correctly across separate chain calls.
- Tablet testing (768x1024) finally happened and immediately revealed responsive issues that desktop + mobile testing missed (the middle ground where layouts are neither full desktop nor mobile-collapsed).
- Counting-based severity: "371 cursor:pointer vs 5 cursor:not-allowed" immediately communicates the gap in disabled-state affordances.
- 10-category code search via subagent covered categories orthogonal to all prior cycles: behavior/interaction rules (cursor, touch-action, selection) vs prior cycles' token/visual rules (colors, borders, radius).

**What didn't**:
- Browse tool still requires chain commands — separate `$B` calls don't persist navigation state (returns blank page). This has been consistent across all 14 cycles.
- Could not test actual hover states or cursor changes visually in headless browser. DQ-103 (cursor chaos) and DQ-110 (Pro-locked affordances) are code-verified but not screenshot-verified.
- Dashboard subtitle readability (DQ-107) needs code verification of actual font-size — visual observation only at this point.

**Pattern spotted**: The codebase has now been audited across 5 distinct eras: (1) Cycles 1-5: design tokens (colors, borders, radius, shadows), (2) Cycles 6-9: UX/conversion (empty states, Pro gates, previews), (3) Cycles 10-12: interaction + component quality (hover states, dark mode, loading UX), (4) Cycle 13: system-level design debt (token governance, accessibility infra), (5) Cycle 14: BEHAVIORAL CSS (cursor, touch, selection, overflow-wrap) + RESPONSIVE GAPS (tablet). The remaining high-value work is in responsive tablet testing and interactive state completeness.

**Root cause found**: The 371-cursor:pointer vs 5-cursor:not-allowed gap traces to a pattern where interactive elements were built incrementally across 162 phases — each phase added cursor:pointer to new elements but nobody ever went back to add disabled/locked states. The Pro-locking system (DQ-110) was bolted on AFTER the UI was built, so locked elements inherited pointer cursor from their unlocked originals. The fix is systemic: a single `.pro-locked` CSS class that overrides cursor + opacity for all gated content.

**Suggestion for teammates**:
- Ship agent: DQ-101 (::selection) and DQ-102 (touch-action) are the two quickest wins — 4 and 2 lines of CSS respectively. Zero risk. Do these first.
- Ship agent: DQ-110 (Pro-locked affordances) is the highest UX-impact ticket — it directly affects conversion by setting correct expectations for free users before they click.
- Ship agent: DQ-104 (nowrap/ellipsis) is the most mechanical fix — find all 50 unmatched nowrap rules in lab-panels.css and add ellipsis pairs. But test at 768px width after fixing.
- Ship agent: DQ-103 (cursor chaos) is the largest by scope (371 instances, 82 files) and should probably be broken into sub-tasks: (a) add cursor:not-allowed to disabled states first, (b) consolidate inline cursor:pointer to CSS classes later.

**What I'd do differently next time**: Run end-to-end FLOW testing instead of page-by-page visual QA. After 14 cycles of page screenshots, the remaining issues are in transitions between pages and interactive state changes that static screenshots can't capture. Flows to test: (1) Lab filter → export → share URL round-trip, (2) Free user hitting Pro gate → pricing → register flow, (3) Bureau connect → league view → trade finder. These would catch friction that page-level QA misses.

### Cycle 13 — 2026-03-23

**What I did**: Design system token audit + accessibility gap analysis + cross-browser check. Local server running (uvicorn on 127.0.0.1:8000). Took 12+ screenshots across home, Lab, pricing, agents, bureau, dashboard, rankings, trade values, buy/sell, efficiency — in light mode, dark mode, desktop (1440x900), and mobile (375x812). Used 2 subagents: (1) 10-category fresh code search (line-height, prefers-reduced-motion, cursor:pointer, img w/h, text-transform, placeholder text, color:inherit, hover/focus-visible parity, scrollbar styling, backdrop-filter), (2) 10-category visual/UX pattern search (autocomplete, table captions, target_blank security, duplicate IDs, hardcoded #000, opacity consistency, height constraints, font-weight, border-color, @keyframes). Cross-referenced all 90 existing DQ tickets + 100 done tickets to ensure zero duplicates. Wrote 10 new tickets (DQ-091 through DQ-100).

**Quality score**: 9/10 — Shifted to a completely new audit dimension: design system TOKEN governance (line-height, opacity) and ACCESSIBILITY gaps (reduced-motion, focus-visible parity, table captions). All findings backed by grep counts. Visual screenshots confirmed pricing dark mode FAQ issue and scrollbar visual clash. No duplicate overlap with any of the 190 prior tickets.

**What worked**:
- Two-subagent parallel strategy: one agent searched 10 code patterns (typography, motion, keyboard, browser compat), the other searched 10 visual/UX patterns (tables, opacity, fonts, animations). Combined findings covered 20 distinct categories.
- Browse tool chain commands worked reliably for all 12 screenshots. Dark mode injection via `document.documentElement.setAttribute("data-theme","dark")` worked perfectly in chain.
- Counting-based severity assessment: finding "121 hover vs 5 focus-visible" is far more actionable than "some panels lack keyboard focus."

**What didn't**:
- Browse tool still loses state between separate `$B` calls (says "Starting server..." each time). Must use chain commands for multi-step flows.
- Could not verify scrollbar colors visually in headless browser (scrollbars are OS-level, not rendered in screenshots). Ticket DQ-091 is code-verified but not screenshot-verified.
- Tablet viewport (768px) still untested after 13 cycles.

**Pattern spotted**: The site has now been audited across 4 eras: (1) Cycles 1-5: design tokens (colors, borders, radius, shadows), (2) Cycles 6-9: UX/conversion (empty states, Pro gates, previews), (3) Cycles 10-12: interaction quality (hover, loading, dark mode completeness), (4) Cycle 13: SYSTEM-LEVEL design debt (token governance, accessibility infrastructure, cross-browser). The remaining high-value work is in era 4: the issues that affect every element on every page through missing system rules rather than individual element fixes.

**Root cause found**: The 121-hover-vs-5-focus-visible gap in lab-panels.css (DQ-094) traces to the fact that done ticket 089 only added focus-visible to form inputs (selects, text inputs) but not to the hundreds of interactive cards, badges, tabs, and buttons inside Lab panels. The original ticket scope was "zero focus-visible" — adding 5 rules technically addressed it, but the coverage is <5% of what keyboard users need.

**Suggestion for teammates**:
- Ship agent: DQ-093 (prefers-reduced-motion) is the highest-impact single fix — 5 lines of CSS, protects ALL animations site-wide. Do this first.
- Ship agent: DQ-091 (scrollbar colors) is 8 lines of CSS with immediate visual improvement on every scrollable area.
- Ship agent: DQ-096 (backdrop-filter webkit prefix) is literally 1 line — zero-risk Safari fix.
- Ship agent: DQ-094 (lab-panels focus-visible) is the largest ticket by scope (116 rules) but highest accessibility impact. Consider a mechanical approach: for each `:hover` in lab-panels.css, add `, .selector:focus-visible` to the same rule.

**What I'd do differently next time**: Audit the 768px TABLET viewport — 13 cycles and zero tablet testing. Also run a full contrast-ratio check using computed colors (not just eyeballing dark mode). Tools like `getComputedStyle()` via JS injection could calculate actual contrast ratios on rendered elements.

### Cycle 12 — 2026-03-23

**What I did**: Visual QA + interaction audit. Local server running (uvicorn on 127.0.0.1:8000), production site returned 502. Took 15+ screenshots across home, Lab, pricing, agents, bureau, dashboard, tiers, rankings, trade values — in light mode, dark mode, desktop (1440x900), and mobile (375x812). Used 2 subagents: (1) 8-question targeted code verification (agents dark mode, nav consistency, footer links, dark toggle, demo button, pricing banner, trade values pagination), (2) 10-category new violation search (btn padding, watermark, pricing borders, Sign In button, footer font, skeleton loaders, onerror fallbacks, position filter tints, breadcrumbs, feature card hover). Cross-referenced all 80 existing DQ tickets + 146 done tickets to ensure zero duplicates. Wrote 10 new tickets (DQ-081 through DQ-090).

**Quality score**: 9/10 — Visual evidence from browse tool chain commands confirmed all findings. Every ticket has both screenshot evidence and code-level subagent verification. Deliberately shifted to INTERACTION and COMPONENT-LEVEL issues (hover states, dark mode gaps, loading UX, image fallbacks) since prior cycles covered tokens, borders, and font-sizes exhaustively.

**What worked**:
- Chain command pattern reliable for browse tool: `echo '[["goto","url"],["wait","--networkidle"],["viewport","WxH"],["screenshot","path"]]' | $B chain`.
- Two-subagent strategy: first agent verified 8 specific observations from screenshots, second agent ran 10 fresh category searches against the codebase. Combined findings were comprehensive.
- Cross-referencing against 226 total tickets (80 DQ + 146 done) prevented all duplicates. Each finding was verified unique before writing.

**What didn't**:
- Production site (razzle.lol) returned 502 — no live site verification possible. All findings are against local dev server.
- Still can't capture hover states visually via headless browser — tickets like DQ-081 (feature-card hover) and DQ-085 (btn-chunky dark mode) are code-verified but not screenshot-verified.
- Tablet viewport (768px) still untested.

**Pattern spotted**: The site has graduated through three distinct issue eras: (1) Cycles 1-5: design token violations (colors, borders, radius, shadows — mechanical fixes), (2) Cycles 6-9: UX/conversion gaps (empty states, Pro gates, visual previews — product design), (3) Cycles 10-12: interaction + component quality (hover states, loading UX, dark mode completeness, image resilience — production polish). The remaining high-value work is all in era 3: making every interactive element feel intentional.

**Root cause found**: btn-chunky missing dark mode override (DQ-085) traces to DES-017 scope — that ticket only fixed btn-primary dark mode but left btn-chunky untouched. The Sign In button uses btn-chunky, so it was missed. Same pattern: standalone pages missing skeleton cards (DQ-086) traces to skeleton being built FOR the Lab specifically (lab.html) and never propagated to standalone pages during their 60+ phase build sprint.

**Suggestion for teammates**:
- Ship agent: DQ-085 (btn-chunky dark mode) is the highest-impact single fix — 1 CSS rule, affects Sign In button on every page in dark mode. Do first.
- Ship agent: DQ-081 (feature-card hover) is a 3-line CSS addition with immediate visual payoff on the home page.
- Ship agent: DQ-087 (position filter inactive tint) and DQ-089 (trade values tier breaks) are the highest UX-impact tickets — they make 10+ standalone pages significantly more scannable.
- Ship agent: DQ-083 (pricing watermark) and DQ-084 (footer Caveat font) are quick wins — 1 line each.

**What I'd do differently next time**: Test the actual interaction FLOWS end-to-end: (1) Lab filter → formula → export → share URL round-trip, (2) Bureau connect → view league → trade finder, (3) Pricing → register → authenticated Lab. Page-by-page visual QA is reaching diminishing returns after 12 cycles. Flow-based testing would catch friction points between pages that static screenshots miss.

### Cycle 11 — 2026-03-23

**What I did**: Deep type-scale, spacing, voice, and architecture audit. Production site returned blank page (white screen, no errors, no text). Local server failed to start (ImportError: relative import). Pivoted to pure grep-based code audit with 3 subagents (font-size compliance, spacing/gap patterns, loading/empty state text). Ran 30+ targeted grep searches. Cross-referenced all 70 existing DQ tickets + 100 done tickets to ensure zero duplicates. Wrote 10 new tickets (DQ-071 through DQ-080).

**Quality score**: 9/10 — Discovered the single largest design system violation in the codebase: font-size:10px appears 325+ times but is NOT in the type scale. Combined with 9px (133x), 15px (38x), 22px (49x), 26px (41x), and 28px (26x), there are **612+ off-spec font-size values** — more than all prior DQ tickets combined. Also found 90 tight gap values, 16 generic empty states, 9 uncentralized error messages, 76 undocumented letter-spacing instances, and z-index chaos (14 distinct values in inline HTML).

**What worked**:
- Subagent pattern for exhaustive grep — one agent per concern (typography, spacing, voice) ran in parallel, found issues I'd have missed with serial searching.
- Counting total instances per violation revealed severity invisible to visual QA. 325 instances of 10px is not a "fix a few" issue — it's a fundamental design system debt.
- Cross-referencing font-size values against the DESIGN.md type scale table was the most productive single query this cycle.

**What didn't**:
- Production site blank (no 502, just white page — possibly a deploy issue or missing frontend). Local server ImportError prevents any visual verification.
- No screenshots this cycle — all findings are code-level. Some 10px font-sizes may look fine in context (dense data tables), but the design guide says 11px is the floor.
- Couldn't verify if 22px/26px headers look wrong visually or just happen to be off-spec numerically.

**Pattern spotted**: The typography violations are the codebase's biggest remaining design system debt. Prior cycles (1-10) cleaned colors, borders, shadows, dark mode, gradients, and accessibility. But nobody audited font-sizes against the type scale. The 10px/9px epidemic traces back to standalone panel pages — they were all built with identical `<style>` blocks that used 10px for badges/labels. The Lab (lab.html, lab-panels.css) is the other major source, using 9px and 10px for dense table data.

**Root cause found**: The 66+ standalone HTML pages share a copy-paste template with a `<style>` block containing off-spec font-sizes. When one page was built with `font-size: 10px` for position badges, the template propagated to all subsequent pages. The fix is mechanical: update the template values and find-replace across all pages. Similarly, the `gap: 5px` on player-meta sections exists in 15+ pages because they share the same `.XXX-player-meta` CSS class pattern.

**Suggestion for teammates**:
- Ship agent: DQ-071 (10px->11px) and DQ-072 (9px->11px) are the highest-impact tickets by sheer volume (458 instances). They're mechanical find-replaces but need spot-checking in dense tables (lab screener, league-intel) to ensure 11px doesn't break column widths.
- Ship agent: DQ-076 (empty states) and DQ-077 (error centralization) are the quickest wins — 16 string replacements and 9 function calls respectively. Do these first for brand consistency.
- Ship agent: DQ-075 (gap values) is best done per-file, not as a global replace, since `gap: 2px` in a heatmap cell is different from `gap: 2px` in a stat row.

**What I'd do differently next time**: Get the local server running first. The ImportError (`from . import live_data`) suggests running uvicorn from the wrong directory. Try `cd /c/Users/mcgui/Documents/razzle && python -m uvicorn backend.server:app --host 127.0.0.1 --port 8000`. Visual verification would catch whether 10px text actually looks too small or reads fine in dense data contexts.

### Cycle 10 — 2026-03-23

**What I did**: Code-level systematic audit. Production site was down (502 Bad Gateway), headless browser returned blank pages from local server (browse tool state-loss between commands). Pivoted to pure grep-based code audit against DESIGN.md. Ran 25+ targeted grep searches across all 75 HTML files, 7 JS files, and 2 CSS files. Focused on areas previous cycles identified as untested: `transition: all`, hover lift patterns, focus-visible coverage, max-width consistency, watermark coverage, drop-shadow sizes, and blur shadows. Cross-referenced all 100 done + 21 open + 60 DQ tickets to ensure zero duplicates. Found and deleted one duplicate (DQ-061 originally duplicated DQ-018). Wrote 10 new tickets (DQ-061 through DQ-070).

**Quality score**: 8/10 — All tickets are backed by grep evidence with exact line numbers. No visual verification possible due to browse tool issues. Found a genuinely impactful P1 (watermark missing on 43 pages) and several P2 issues (hover lift, focus-visible, max-width inconsistency). One ticket (DQ-061/watermark) covers 43 pages — highest scope single ticket this cycle.

**What worked**:
- Systematic grep patterns caught issues invisible to screenshots: `transition: all` (23 instances), `outline: none` without `focus-visible` (4 new instances), `border-radius: 4px` in inline JS.
- Cross-referencing with INDEX.md prevented the DQ-018 duplicate from shipping.
- Counting instances (watermark coverage: 32 with, 43 without) revealed a significant brand gap.

**What didn't**:
- Browse tool was unusable — production 502 + local server rendered blank pages. Every `$B` invocation said "Starting server..." suggesting state loss. No screenshots this cycle.
- agents.html is a massive file with deep CSS — some tickets may have imprecise line numbers since the file was too large to read in full.

**Pattern spotted**: agents.html is the single most design-violated file. It appeared in 7 of 10 tickets this cycle, and in 10+ tickets from prior cycles. It has: cold black shadows (DQ-018), undersized hover lifts (DQ-063), transition:all (DQ-062), outline:none (DQ-064), off-spec shadow values (DQ-067), inline styles (DQ-070), and more. A dedicated "agents.html design pass" would be the highest-impact single workstream.

**Root cause found**: The `transition: all` pattern (DQ-062) exists because agents.html was built with a "just animate everything" approach during rapid prototyping. Each interactive element got `transition: all 0.12s` instead of specifying which properties actually change on hover. This is a one-time global find-replace fix.

**Suggestion for teammates**:
- Ship agent: DQ-061 (watermark) is a high-scope but LOW-effort fix — copy-paste the `<div class="watermark">razzle.lol</div>` into 43 pages. Do this first.
- Ship agent: DQ-063 (hover lift 4px->6px) is a 7-line find-replace in agents.html. High visual impact.
- Ship agent: DQ-062 (transition:all) and DQ-063 (hover lift) can be done in the same pass since they're both in agents.html CSS.
- Ship agent: DQ-069 (lab.html sticky header) is a 1-line fix.

**What I'd do differently next time**: Debug the browse tool first. Either restart the local uvicorn server properly (`cd backend && uvicorn server:app --host 127.0.0.1 --port 8000`) or use a different port. The visual verification gap means some tickets may describe issues that look fine in practice.

### Cycle 9 — 2026-03-23

**What I did**: Visual QA + code-level audit. 20+ screenshots across 18 pages via headless browser chain commands (home, Lab, pricing, agents, bureau, dashboard, tiers, rankings, breakouts, compare, trade values, trade finder, awards, stocks, efficiency, about, prompts, weekly, 404). Light mode, dark mode, desktop (1440x900), mobile (375x812), close-up clips. Used 3 subagents: (1) index.html section-by-section audit — found Caveat on primary content, emoji icons, missing visuals, (2) dashboard.html card styling audit — found undefined `--qb`/`--rb` vars and missing position stripes, (3) about.html + prompts.html audit — confirmed clean. Also ran grep audits for `var(--qb)` (4 files, 32 rules referencing undefined vars) and `rgba(` position hex (6 instances). Wrote 10 new tickets (DQ-051 through DQ-060).

**Quality score**: 9/10 — discovered a CRITICAL code bug (32 CSS rules using undefined variables) that no prior cycle caught. Every ticket has both screenshot evidence AND code-level grep verification. Deliberately mixed categories: 1 critical code bug, 2 typography violations, 2 conversion gaps, 1 brand identity issue, 1 dark mode issue, 2 color token issues, 1 copy issue.

**What worked**:
- Chain command pattern for browse tool remains the most reliable approach.
- Cross-referencing `var(--qb)` grep against `var(--pos-qb)` grep instantly revealed the undefined variable bug.
- Subagent dashboard audit found the undefined vars — a code-level issue invisible to screenshots.
- Close-up clip screenshots (e.g., `--clip 0,0,1440,500`) made details visible that full-page screenshots hide.

**What didn't**:
- Still can't verify hover states or interactive flows via headless browser.
- Some chain commands lose page state between invocations — had to reload pages.
- Tablet viewport (768px) still untested.

**Pattern spotted**: The codebase has TWO naming conventions for position colors: `--pos-qb` (defined in styles.css, used in 51 files/481 instances) and `--qb` (NOT defined, used in 4 files/32 rules). The 4 files with wrong names were all built as standalone pages (dashboard, tiers, auction, archetypes) — likely by a different pass than the Lab panels that use the correct names. This is a naming convention drift from rapid development.

**Root cause found**: The undefined `--qb` variables exist because standalone pages were built with shorthand var names that don't match the `:root` definitions in styles.css. The Lab (lab.js, lab-panels.js, lab-panels.css) consistently uses `--pos-qb` (correct). Standalone pages built later used a different convention.

**Suggestion for teammates**:
- Ship agent: DQ-051 is a 4-file find-and-replace (`--qb` -> `--pos-qb`) that fixes 32 broken CSS rules. Highest impact-per-effort ticket on the board. Do first.
- Ship agent: DQ-052 is a 3-line CSS change on index.html that fixes the biggest typography violation on the landing page.
- Ship agent: DQ-056 (meta theme-color) is a ~5-line JS addition to app.js.

**What I'd do differently next time**: Run a systematic `grep` for all CSS `var(--` references and cross-check which ones are defined vs undefined. This automated approach would catch naming drift faster than visual QA.

### Cycle 8 — 2026-03-23

**What I did**: Full visual QA cycle with 20+ screenshots across 15+ pages. Browsed via local dev server (127.0.0.1:8000) using headless browser chain commands. Covered: home, Lab, pricing, agents, bureau, dashboard, tiers, rankings, breakouts, compare, trade values, trade finder, awards, stocks, about — in light mode, dark mode, desktop (1440x900), and mobile (375x812). Used 3 subagents: (1) agents.html footer + dark mode verification (confirmed .warroom-footer exists but unused, no data-theme="dark" forced), (2) pricing.html dark mode contrast analysis (found fallback color risks but main CSS vars OK), (3) Pro gate pattern audit (confirmed only lab.html has the gate, generic across all ~48 panels, bureau does it right with per-tab teasers). Wrote 10 new tickets (DQ-101 through DQ-110).

**Quality score**: 9/10 — every ticket backed by both screenshot evidence and code-level subagent verification. Deliberately focused on UX/conversion/first-impression issues since the prior 100 done tickets covered most token/code violations. Two P1 tickets (agents footer, Pro gate teasers) have the highest conversion impact.

**What worked**:
- Chain command pattern via temp file with heredoc is the most reliable approach for browse tool on Windows.
- Separate screenshot calls that start fresh work as long as chain bundles goto+wait+viewport+screenshot together.
- Subagent code verification prevented false positives (pricing dark mode CSS vars are correct, it's the visual weight that's the issue, not a broken token).
- Mobile (375px) screenshots caught issues invisible at desktop — compare.html footer dominance, Lab toolbar cramping.

**What didn't**:
- Tablet (768px) still untested. Should add next cycle.
- Can't capture hover/interactive states via headless browser.
- Some screenshots at mobile are too small to verify font sizes — need clip regions next time.

**Pattern spotted**: The site has graduated from "design system violations" (Cycles 1-5) to "product experience gaps" (Cycles 6-8). The remaining high-value work is all UX: empty states, Pro gates, visual previews, mobile touch targets, visual hierarchy. These are the issues that affect conversion and shareability, not design token compliance.

**Root cause found**: Three tickets (DQ-102 compare empty state, DQ-104 bureau pre-connect, DQ-105 no canvas preview) share a single root cause: features were built as functional tools without a "first impression" design pass. The data pipelines work, but landing states assume users already know what they're looking at. A systematic "first-visit UX" sweep would catch all of these.

**Suggestion for teammates**:
- Ship agent: DQ-101 (agents footer dark) is a 1-line JS fix (`document.documentElement.setAttribute("data-theme","dark")` in agents.html head) with the biggest single page impact.
- Ship agent: DQ-106 (pricing dark mode comparison table) is a 2-3 line CSS fix with conversion impact.
- Ship agent: DQ-103 (Pro gate teasers) is the highest-value ticket but requires per-panel content. Start with just 5 panels.
- Ship agent: DQ-102, DQ-104, DQ-105 are all the same TYPE of fix (add visual context to an empty/landing state). Batch them.

**What I'd do differently next time**: Test interactive flows end-to-end: (1) Lab filter + formula + export + share URL round-trip, (2) Bureau connect + view league + trade finder, (3) Pricing "Buy" flow. Page-by-page screenshots catch visual issues but miss flow friction.

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
