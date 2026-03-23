## Designer Insights (updated ticket DES-096)

### Patterns Found
- Home page layout is mostly polished — chunky borders, correct colors, proper font usage
- The design guide is well-followed across pages (sand bg, espresso ink, offset shadows)
- Mobile nav is tight but functional — dark mode toggle has minimal right margin
- 404 page is excellent — on-brand voice, clean layout, proper navigation back
- Agent bio cards on home page use dark Situation Room aesthetic effectively
- League Intel connection page is clean and well-structured
- **Sitewide consistency issues are more impactful than single-page bugs** — DES-003 (ink-light), DES-004 (watermarks), DES-010 (1px borders) each affect 15-58+ pages
- Pages built in different phases have slightly different CSS conventions (page-specific class prefixes, inline styles vs classes)
- The consolidation redirect pattern (standalone -> lab.html?panel=X) is working but footer still links to standalone URLs
- **OG image is the single highest-leverage fix** — every shared link (Twitter, Reddit, Discord) displays the wrong tagline
- No rogue font families found (no sans-serif, arial, helvetica) — good discipline
- No "Loading..." text found — all loading states use personality text (pulling film, etc.) — good
- Auth modal is well-styled structurally — proper chunky borders, dark mode CSS var usage, accessible focus states — but has orphaned numerical values (8px shadow, 16px radius)
- Agent SVG icons all exist at correct paths — no missing assets
- **Dark mode has a systemic `color: white` problem** — 9+ selectors in styles.css (DES-017 to DES-020, now fixed) PLUS 96 instances in lab-panels.css (DES-032) PLUS 121 instances in 69 HTML files (DES-042) = **217 total — ALL NOW FIXED**
- CSS variables for dark mode are correctly DEFINED — the gap was components not USING them
- No gradients, no cold grays, no blue-black ink anywhere — good discipline on banned patterns
- Position colors are 100% correct across all files — QB=blue, RB=teal, WR=terracotta, TE=purple
- Lab sidebar mobile behavior is correct (translateX hide at 768px) — one false alarm from code review
- `overflow-x: auto` is applied inconsistently — some panel tables have it, others use `overflow: hidden` (DES-023, fixed)
- **Conversion path has multiple design debt items** — auth modal shadow/radius orphaned, plan cards no hover, pricing badges sub-minimum radius

### Cycle 5 Findings: JS-Generated Markup Is the Next Frontier
- **lab-panels.css had 171 sub-minimum border-radius instances** — FIXED by DES-047
- **JS-generated inline styles bypass the CSS design system** — lab-panels.js, league-intel.html JS, and formula-store.js generate HTML with hardcoded values
- **league-intel.html had three separate issues** on the conversion pathway: sub-minimum radius (DES-048), wrong text-on-accent variable (DES-049), and broken hover-lift (DES-050) — ALL FIXED
- **Canvas code is well-architectured** — `getCanvasTheme()` in app.js handles bg/ink/white correctly
- **warroom.js is clean** — all hex colors are for pixel art canvas rendering under the Situation Room always-dark exception
- **--text-on-accent contrast is acceptable** — verified both modes

### Cycle 6 Findings: The Deep Inline Style Sweep
- **lab.js had 27 sub-minimum border-radius in inline styles** (DES-057) — FIXED
- **66 standalone HTML pages had ~300 sub-minimum border-radius** (DES-058) — FIXED (13 remain, all intentional bar fills)
- **DES-048 fix was INCOMPLETE** — 6 bar element radius instances remained (DES-059) — FIXED
- **store-card:hover had no shadow lift** (DES-060) — FIXED
- **Canvas hardcoded hex was a systemic pattern** — posColors consolidated (DES-062 FIXED), verdict colors use CSS vars (DES-063 FIXED)
- **Two gradient violations found and fixed** — prompts.html (DES-064 FIXED) and lab.html sparkline (DES-065 FIXED)
- **formula-store.js is 98% design-compliant** — publish modal info box fixed (DES-066 FIXED)

### Cycle 7 Findings: Canvas Accent Color Sweep
- **getCanvasTheme() is the ROOT CAUSE** (DES-069) — it exposes bg/ink/white but NO accent colors. Every canvas function that needs green/blue/orange/red hardcodes hex directly. Fix this one function, and 30+ downstream hex references become simple `t.green` replacements.
- **DOM-context code STILL uses hardcoded hex for tier/grade colors** — DES-067 (draft class tierColors) and DES-068 (trade value tiers) generate DOM HTML with `background:#2ec4b6` instead of `background:var(--green)`. These are easy fixes that don't need the getCanvasTheme change.
- **6+ duplicated tier/grade color objects** (DES-070) — defined separately in different functions with INCONSISTENT values. One copy gives elite and premium the same color (bug, DES-073).
- **college canvas uses raw #5b7fff 6 times** (DES-071) — should be `t.blue` after DES-069.
- **DVS badge in canvas export hardcodes threshold colors** (DES-072) — `#2ec4b6`/`#5b7fff`/`#d97757`/`#8a7565` cascade.
- **Data bar linear-gradient** (DES-074) — functional but technically banned. Can be replaced with div-width pattern.
- **40+ standalone panel pages missing overflow-x:auto** (DES-075) — tables may truncate on mobile when loaded as Lab panel iframes.
- **Heat map function IS dark-mode aware** — separate opacity values for light/dark. No ticket needed.
- **Watermark IS dark-mode aware** — isDark check with correct alpha. No ticket needed.
- **color:white NOW ZERO** — the 217-instance problem from cycles 3-5 is fully resolved.

### Cycle 8 Findings: Accessibility, SEO, and Dark Mode PNG Exports
- **THREE NEW AUDIT DIMENSIONS** — accessibility (ARIA/focus), SEO (h1/canonical/og:url), and dark mode canvas/PNG exports. Previous cycles focused on CSS consistency (colors, radius, borders). Cycle 8 broadens to quality dimensions that affect conversion differently.
- **textColorForBg() is a VISIBLE dark mode bug** (DES-079) — returns hardcoded `#2d1f14` (light-mode ink) always. In dark mode, heatmap cell text is dark espresso on dark espresso backgrounds. Near-invisible. This is a user-facing bug, not a code smell.
- **Trade Analyzer PNG export breaks in dark mode** (DES-080) — `drawSide()` uses `#f2d5d8` / `#d9efec` (light-mode red-light/green-light) hardcoded. These pale pastels look jarring against dark mode export backgrounds. PNG exports are marketing — every shared screenshot carries the watermark.
- **Comp-finder PNG simColor uses light-mode ink-medium** (DES-086) — `#5c4a3d` on dark background = poor contrast.
- **SEO has a structural gap** — 67 of 75 pages missing `<link rel="canonical">` and `<meta property="og:url">`. The 8 main pages have both; the 67 panel pages have neither. This is the #1 SEO issue.
- **5 pages have zero h1 elements** (DES-077) — lab.html (flagship), player.html, compare.html, league-intel.html, 404.html. lab.html is the growth engine and has no heading structure for search engines.
- **regression.html and tdregression.html share identical `<title>` and `og:title`** — SEO duplicate signal.
- **ZERO :focus-visible rules on theme toggle and nav links** (DES-081, DES-082) — affects every page. Keyboard users get no visual focus indicator on the most prominent interactive elements.
- **8+ interactive spans/tds in the Screener lack role="button"** (DES-084) — filter chip remove x, star/watchlist td, pin td, position count badges. Screen readers don't announce them; keyboard users can't reach them. These are CORE screener interactions.
- **5 dynamic modals/overlays missing role="dialog"** (DES-083) — watchlist, roster, tier board, shortcuts, command palette. Static modals in lab.html all have proper ARIA; dynamic ones don't.
- **playerHeadshot() injects hardcoded hex inline** (DES-085) — POS_COLOR_MAP hardcoded in app.js. Not a visible dark mode bug (position colors are same both modes) but bypasses the design system.
- **lab-panels.css has ZERO :focus-visible rules in 4000+ lines** — systemic accessibility gap. Every interactive element in lab panels relies on browser defaults for keyboard focus indication. Not ticketed yet (too broad for one ticket).
- **outline:none without :focus-visible pair in 6+ input selectors** across agents.html, breakdown.html, strengths.html, tradefinder.html — each removes focus indicators with no replacement.

### What Matters Most for Conversion
- **OG image** is seen by more people than the home page itself — it's the preview on every social share (DES-007, FIXED)
- Home page scroll path must be flawless — every section builds the "this is polished" impression
- **Fake testimonials will be caught** on r/DynastyFF — dynasty Reddit users verify everything (DES-008, FIXED)
- Layout orphans (single wrapped elements on centered rows) undermine credibility
- The Screener is the growth engine — its pages need to be screenshot-worthy
- Mobile experience matters hugely since Twitter/Reddit traffic is mobile-heavy
- **Watermarks are the #1 brand exposure channel** — every shared screenshot carries them
- Pricing page visual parity with home page matters — users bounce between them during conversion decision
- **Dark mode must work perfectly** — power users toggle it, and broken dark mode = "unfinished product"
- **PNG exports ARE marketing** — screenshots with hardcoded colors on dark mode look wrong
- **Bureau connect card is the conversion engine's front door** — all 3 violations fixed
- **DOM tier badges** (DES-067, DES-068) affect every panel that shows tiers — users see these constantly
- **getCanvasTheme accent colors** (DES-069) is a platform fix — solves the problem at the root instead of patching individual symptoms
- **SEO fundamentals** (canonical, h1) are table stakes — without them, organic traffic is structurally impaired
- **Keyboard accessibility** directly affects power users — dynasty managers use keyboard shortcuts (J/K navigation, H for heat, etc.), so missing focus-visible on nav/toggle is inconsistent with the keyboard-first design

### Issue Categories by Impact
1. **P1 — Visible dark mode bugs** — DES-079 (textColorForBg), DES-080 (Trade Analyzer PNG)
2. **P1 — SEO fundamentals** — DES-077 (h1 on lab.html), DES-078 (canonical/og:url on 67 pages)
3. **P1 — Keyboard accessibility** — DES-081 (theme toggle focus), DES-084 (interactive spans role=button)
4. **P2 — Accessibility completeness** — DES-082 (nav focus), DES-083 (modal ARIA)
5. **P2 — Canvas dark mode consistency** — DES-085 (headshot hex), DES-086 (comp-finder PNG)

### Emerging Patterns (updated DES-086)
- **Canvas hardcoded hex is now the dominant remaining design system issue** — ~30 hex color references in canvas code that could read from CSS vars if getCanvasTheme had accent properties (DES-069 is still the keystone).
- **Accessibility is the next major frontier** — cycles 1-7 focused on visual consistency (colors, radius, borders, shadows). Cycle 8 reveals that ARIA attributes and keyboard focus are systematically under-implemented.
- **SEO was never audited before** — 67 pages missing canonical URLs is a structural gap that predates all design QA work.
- **PNG export dark mode is a pattern** — DES-080, DES-086, and several more (roster builder, boom/bust) all hardcode light-mode colors in canvas export functions. After DES-069 adds accent colors to the theme object, these become simple replacements.
- **The codebase has matured significantly** — color:white is zero, sub-minimum radius is down to intentional bar fills, no rogue fonts, no generic loading text, no cold grays.
- **DRY violations in lab.js** — tier/grade colors defined 6+ times, some with inconsistent values. posColors was consolidated (DES-062) — same pattern needed for tier/grade.
- **Things that are GOOD and should be preserved:**
  - Zero rogue font families (confirmed cycle 8)
  - Zero generic "Loading..." text (confirmed cycle 8)
  - Zero gradients in CSS classes (2 inline cases were fixed)
  - Zero cold grays (confirmed cycle 8)
  - Zero blue-black ink colors (confirmed cycle 8)
  - Zero color:white/color:#fff in lab.js or HTML pages (confirmed cycle 8)
  - Zero 1px borders in lab.js (confirmed cycle 8)
  - 100% correct position colors via _POS_COLORS_CSS + _getPosColorsHex()
  - Dark mode CSS variables all correctly defined
  - Agent SVG icons all exist
  - getCanvasTheme() pattern correctly used for bg/ink (just needs accent extension)
  - warroom.js pixel art cleanly isolated under Situation Room dark exception
  - --text-on-accent contrast verified acceptable in both modes
  - Heat map (getHeatColor) is dark-mode aware
  - Watermark (drawRazzleWatermark) is dark-mode aware
  - formula-store.js 98% design-compliant
  - All box-shadow:6px instances are on :hover states (correct per design guide)
  - Static modals in lab.html all have proper role="dialog" + aria-modal + aria-labelledby
  - Main nav has aria-label="Main navigation"
  - Lab sidebar has role="navigation" + aria-label
  - Auth modal uses role="dialog" with labeled inputs
  - All 75 pages have viewport meta, unique title, unique description

### Cycle 9 Findings: Deep ARIA Accessibility Audit
- **outline:none is used 17 times across 8 files** — 6 have proper :focus-visible pairs (styles.css controls), 11 do NOT (DES-087). The 4 correctly-paired selectors (.auth-form input, .input-chunky, .select-chunky, .cmd-palette-input) establish the pattern; the 11 broken ones just need to match it.
- **lab-panels.css confirmed ZERO :focus-visible rules** (DES-089) — 4300+ lines, governing 60+ panels, with not a single keyboard focus indicator beyond browser defaults. This is the largest single accessibility gap in the codebase.
- **28+ JS-created canvas elements have no ARIA** (DES-090) — 14 in lab.js, 10 in lab-panels.js, 2 in charts.js, 2 in compare.js, 2 in player.js. Contrast: the static canvases in lab.html all have proper role="img" + aria-label. The pattern exists; it just wasn't applied to createElement calls.
- **Context menu is a fully interactive menu with zero ARIA** (DES-088) — creates divs, not menu/menuitem roles. Has no arrow key navigation. This is the right-click menu used constantly by Lab power users.
- **Toast notifications (_showToast) have no role="alert"** (DES-092) — used across 7 JS files. Screen readers never announce action confirmations.
- **Autocomplete pattern repeated across 10+ pages with zero combobox attributes** (DES-094) — search input + dropdown + items exist but without role="combobox", role="listbox", role="option", aria-expanded. The same pattern copy-pasted 10 times, all missing the same ARIA.
- **Result count and loading states have no aria-live** (DES-093) — #resultCount and #loadingText update dynamically without being announced. Standalone pages have the same issue (DES-096).
- **Skip-to-content links work but use inline JS on all 75 pages** (DES-095) — identical onfocus/onblur handlers repeated 75 times instead of one CSS class.
- **agents.html API key inputs already have aria-label** — verified clean, no ticket needed.
- **All 75 pages have lang="en"** — verified clean.
- **Only cheatsheet.html has @media print CSS** — low priority, not ticketed this cycle.

### Issue Categories by Impact (updated DES-096)
1. **P1 — Visible dark mode bugs** — DES-079 (textColorForBg), DES-080 (Trade Analyzer PNG)
2. **P1 — SEO fundamentals** — DES-077 (h1 on lab.html), DES-078 (canonical/og:url on 67 pages)
3. **P1 — Keyboard accessibility** — DES-081 (theme toggle focus), DES-084 (interactive spans), DES-087 (11 inputs no focus-visible), DES-089 (lab-panels.css zero focus-visible)
4. **P1 — Screen reader accessibility** — DES-088 (context menu ARIA), DES-090 (28+ canvas no ARIA), DES-092 (toast no alert), DES-094 (autocomplete no combobox)
5. **P2 — Live regions** — DES-093 (result count), DES-096 (standalone page loading states)
6. **P2 — Canvas ARIA templates** — DES-091 (10 HTML page canvases)
7. **P2 — Maintainability** — DES-095 (skip-link inline JS x75)

### Emerging Patterns (updated DES-096)
- **Accessibility is now the dominant remaining quality gap** — cycles 1-8 cleaned up visual consistency (colors, radius, borders, fonts, dark mode). The codebase looks correct. But it isn't accessible. Cycle 9 reveals that ARIA patterns, keyboard focus, and live regions are systematically missing.
- **The autocomplete copy-paste pattern** is the clearest example: 10+ pages have the exact same search+dropdown implementation, all missing the exact same ARIA attributes. One template fix could solve all of them.
- **Canvas ARIA follows the same split as canvas hex colors did** — static HTML canvases are correct (lab.html), JS-created canvases are not. Same root cause: the createElement pattern doesn't include ARIA setup.
- **Toast is a single-function fix** — _showToast() in app.js is the only toast creator. Add role="alert" once, and all 7 consuming JS files get accessible notifications.
- **lab-panels.css :focus-visible gap is the accessibility equivalent of the 171-radius ticket** (DES-047) — a systemic gap in one file that affects every panel.
- **The keyboard-first design philosophy (J/K nav, H for heat, T for tiers, ? for shortcuts) is undermined** by missing :focus-visible on inputs, missing keyboard nav on context menus, and missing ARIA on interactive elements. Dynasty power users are keyboard-heavy — this matters.
- **Things that are GOOD and should be preserved:**
  - Zero rogue font families (confirmed cycle 9)
  - Zero generic "Loading..." text (confirmed cycle 9)
  - Zero gradients in CSS classes
  - Zero cold grays
  - Zero blue-black ink colors
  - Zero color:white/color:#fff in lab.js or HTML pages
  - Zero 1px borders in lab.js
  - All 75 pages have lang="en" (confirmed cycle 9)
  - All 75 pages have skip-to-content links (functional, just needs CSS class)
  - agents.html API key inputs have aria-label (confirmed cycle 9)
  - Static canvases in lab.html have proper role="img" + aria-label
  - Existing :focus-visible pattern in styles.css is correct and consistent
  - agents.html config/roster toggles correctly use aria-expanded

### Cycle 10 Findings: Contrast, Touch Targets, Form Validation, Resilience

Three new audit dimensions this cycle — moving beyond ARIA to the visual/physical accessibility layer:

- **ZERO aria-describedby in the entire codebase** (DES-097) — no form input links to its error message. Auth modal, pricing promo code, Sleeper connect, and formula publish all show error text visually but never announce it. This is the #1 conversion blocker for assistive tech users — if you can't sign up, you can't pay.
- **ZERO role="alert" in the entire codebase** (DES-097) — dynamic error messages never get announced. The agent-voiced error copy (razzleError(), getErrorText()) is excellent brand work — it just needs to be heard.
- **--ink-light dark mode contrast fails WCAG AA** (DES-098) — #8a7565 is "shared" between modes per DESIGN.md, but on dark background #2d1f14 it's below 4.5:1 for normal text. 1,122 uses across 86 files. Needs a dark-mode-specific override. Also: 9 placeholder selectors inherit the same problem.
- **--ink-faint used as text color** (DES-103) — DESIGN.md says "Dividers, dashed borders" but 53 instances use it for text. Contrast ~1.8:1 on sand background — nearly invisible.
- **Filter chip remove buttons are 13-16px** (DES-099) — the most-used interactive element in the screener fails WCAG 2.5.8 (24px minimum). Mobile traffic from Twitter/Reddit can't hit these reliably.
- **Briefing card headers are plain div onclick** (DES-100) — no role, no aria-expanded, no keyboard handler. This is the premium product's primary output — the analysis users pay for.
- **No global error handler** (DES-101) — app.js has no window.onerror or unhandledrejection. The existing agent-voiced error patterns (razzleError, getErrorText, apiFetch) handle expected errors well. Unexpected errors silently kill the page.
- **89 JS animation calls don't check prefers-reduced-motion** (DES-102) — CSS media query exists and is well-implemented, but JS animations (warroom sprite loop, lab smooth scroll, toast slide) bypass it.
- **Formula publish is color-only validation** (DES-104) — red border, no text, no aria-invalid. Unique because there's not even an error message container.
- **Canvas help text is pixels** (DES-105) — warroom.js draws keyboard shortcuts on the canvas. Invisible to screen readers, disappears on interaction.
- **Nav search hint is 19px tall** (DES-106) — the entry point to global search (Ctrl+K command palette) is below the 24px touch target minimum.

### Issue Categories by Impact (updated DES-106)
1. **P1 — Form validation accessibility** — DES-097 (zero role=alert, zero aria-describedby — conversion blocker)
2. **P1 — Color contrast** — DES-098 (--ink-light dark mode), DES-103 (--ink-faint as text)
3. **P1 — Touch target sizing** — DES-099 (filter chip remove), DES-106 (nav search hint)
4. **P1 — Situation Room accessibility** — DES-100 (briefing cards), DES-105 (canvas help text)
5. **P1 — Resilience** — DES-101 (no global error handler)
6. **P1 — Keyboard accessibility** — DES-081, DES-084, DES-087, DES-089 (from cycle 8-9)
7. **P1 — Screen reader accessibility** — DES-088, DES-090, DES-092, DES-094 (from cycle 9)
8. **P2 — Motion sensitivity** — DES-102 (JS animations ignore prefers-reduced-motion)
9. **P2 — Form validation completeness** — DES-104 (formula publish color-only)
10. **P2 — Live regions** — DES-093, DES-096 (from cycle 9)

### Emerging Patterns (updated DES-106)
- **The codebase is visually mature but functionally inaccessible** — 10 cycles of visual QA have eliminated every color, font, radius, border, and dark mode issue. What remains is the invisible layer: ARIA, contrast ratios, touch targets, and error handling. These don't show up in screenshots but directly affect whether users can convert.
- **Error handling shows a fascinating split** — the agent-voiced ERROR COPY is excellent (razzleError(), getErrorText(), panel-specific messages). But the error CONTAINERS lack every ARIA attribute. The personality is there; the plumbing isn't.
- **Touch targets are a systemic mobile issue** — filter chips, team chips, compare chips, roster builder chips, nav badges — every small interactive element uses font-size + minimal padding without considering the 24px minimum. A global `.touch-target { min-width: 24px; min-height: 24px; }` utility class could fix many at once.
- **--ink-light "shared" between modes was a design decision that needs revisiting** — in light mode it's borderline (metadata/labels can be lighter). In dark mode it fails. A dark mode override to ~#a89888 would fix 1,122 uses without changing the light mode aesthetic.
- **The Situation Room has the largest concentration of remaining a11y issues** — briefing cards (DES-100), canvas help text (DES-105), plus from earlier cycles: missing canvas ARIA (DES-090), no keyboard agent selection documentation. This is the premium product — it should be the most accessible, not the least.
- **Things that are GOOD and should be preserved:**
  - Zero rogue font families (confirmed cycle 10)
  - Zero generic "Loading..." text (confirmed cycle 10)
  - Zero gradients in CSS classes
  - Zero cold grays, zero blue-black ink
  - Zero color:white/color:#fff in lab.js or HTML pages
  - Zero 1px borders in lab.js
  - All 75 pages have lang="en"
  - All 75 pages have skip-to-content links
  - Agent-voiced error copy throughout (razzleError, getErrorText, panel-specific)
  - apiFetch() handles 401 gracefully (auto-reopens auth modal)
  - prefers-reduced-motion CSS media query correctly implemented
  - Error states preserve previous data (don't clear table on fetch failure)
  - Sleeper API errors are specific and helpful ("couldn't find that username", "servers are napping")

### What to Check Next (Cycle 11)
- After DES-097: verify screen reader announces login error when invalid credentials entered
- After DES-098: verify --ink-light contrast ratio >= 4.5:1 in dark mode with new override value
- After DES-099: verify filter chip remove buttons are tappable on 375px mobile viewport
- After DES-100: verify briefing cards toggle with Enter/Space keys, aria-expanded updates
- After DES-101: verify a Razzle-voiced toast appears on simulated JS error (throw in console)
- After DES-102: verify warroom.js agents don't animate with prefers-reduced-motion: reduce
- og:image could be page-specific for high-traffic tool pages (currently generic on 74/75)
- Print CSS audit — only cheatsheet.html has @media print
- SVG icon alt text — do agent SVG icons in sidebar have accessible names?
- Table caption/summary — do data tables have captions for screen readers?
- Color-blind safe mode — position colors (QB blue, RB teal, WR terracotta, TE purple) rely on color alone in many places
- Scroll indicators on horizontally scrolling tables — visual cue that content extends offscreen
