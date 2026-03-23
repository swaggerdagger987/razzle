## Designer Insights (updated ticket DES-066)

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
- **Dark mode has a systemic `color: white` problem** — 9+ selectors in styles.css (DES-017 to DES-020, now fixed) PLUS 96 instances in lab-panels.css (DES-032) PLUS 121 instances in 69 HTML files (DES-042) = **217 total**
- CSS variables for dark mode are correctly DEFINED — the gap is components not USING them
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
- **lab.js has 27 sub-minimum border-radius in inline styles** (DES-057) — this is the JS equivalent of what DES-047 fixed in CSS. Affects badges, buttons, bar tracks, and KBD elements across the Screener.
- **66 standalone HTML pages have ~300 sub-minimum border-radius** (DES-058) — the largest remaining governance gap. Every panel page has 1-32 instances in its `<style>` block. Total ~300 instances.
- **DES-048 fix was INCOMPLETE** — 6 bar element radius instances still remain on league-intel.html (DES-059). Pressure bar track (3px), depth bar track (4px), waiver bars (3px), and one JS inline style (4px).
- **store-card:hover has no shadow lift** (DES-060) — hover shadow is 4px (same as rest), should be 6px. Formula Store cards feel dead compared to every other card component.
- **Canvas hardcoded hex is a systemic pattern** — league-intel.html canvas (DES-061, 6 instances) and lab.js (DES-062, 14+ duplicated posColors objects). These won't adapt to dark mode.
- **lab.js has an orphaned gold color** — `#c5a000` is used for FAIR verdicts but isn't a design token. Should be `--yellow` (#ffc857). Also, verdict/sentiment colors are all hardcoded hex (DES-063).
- **Two gradient violations found** — prompts.html text fade (DES-064) and lab.html sparkline placeholder stripes (DES-065). Design guide bans gradients with no exceptions.
- **formula-store.js is 98% design-compliant** — excellent CSS variable usage. Only the publish modal info box has one 6px radius violation (DES-066).

### What Matters Most for Conversion
- **OG image** is seen by more people than the home page itself — it's the preview on every social share (DES-007, FIXED)
- Home page scroll path must be flawless — every section builds the "this is polished" impression
- **Fake testimonials will be caught** on r/DynastyFF — dynasty Reddit users verify everything (DES-008, FIXED)
- Layout orphans (single wrapped elements on centered rows) undermine credibility
- The Screener is the growth engine — its pages need to be screenshot-worthy
- Mobile experience matters hugely since Twitter/Reddit traffic is mobile-heavy
- **Watermarks are the #1 brand exposure channel** — every shared screenshot carries them
- **CSS variable mismatches (DES-003) affect typographic hierarchy sitewide** (FIXED)
- Pricing page visual parity with home page matters — users bounce between them during conversion decision
- Panel count on pricing page (60+) undersells the actual product (67+ panels) (DES-013, FIXED)
- **Dark mode must work perfectly** — power users toggle it, and broken dark mode = "unfinished product"
- **Pricing page at tablet widths** is a real conversion risk — iPad users are in the target demographic (DES-024, FIXED)
- **Auth modal is the conversion gateway** — every registration and login passes through it (DES-027, DES-028, FIXED)
- **Plan cards need hover-lift** — the pricing page is the decision point (DES-030, FIXED)
- **PNG exports ARE marketing** — compare page and Lab exports with hardcoded colors don't match dark mode (DES-034, FIXED)
- **Bureau connect card is the conversion engine's front door** — 3 design violations fixed (DES-043, FIXED)
- **Footer breaks on 71 pages at 375px** — mobile users from Twitter/Reddit hit broken footers everywhere (DES-037, FIXED)
- **Store-card hover-lift is broken** — Formula Store cards don't pop on hover (DES-060, NEW)
- **Trade Analyzer verdict colors break in dark mode** — hardcoded hex bg/text (DES-063, NEW)
- **Canvas position colors don't adapt to dark mode** — 14+ copies of hardcoded hex in lab.js (DES-062, NEW)

### Issue Categories by Impact
1. **P0 — Launch blockers** — OG image wrong tagline (DES-007) [DONE]
2. **P1 — Sub-minimum radius systemic** — lab.js 27 (DES-057), 66 HTML pages ~300 (DES-058), league-intel bars 6 (DES-059)
3. **P1 — Hover-lift missing** — store-card (DES-060)
4. **P1 — Lab panel CSS governance** — 171 sub-minimum radius in lab-panels.css (DES-047) [DONE]
5. **P1 — Bureau conversion path** — radius (DES-048 DONE), badge contrast (DES-049 DONE), hover-lift (DES-050 DONE)
6. **P1 — Mobile breaking** — footer minmax(140px) on 71 pages (DES-037) [DONE]
7. **P1 — Conversion gateway** — auth modal (DES-027, DES-028), plan cards (DES-030) [ALL DONE]
8. **P1 — Sitewide dark mode** — btn-primary, nav, auth, chips, cmd-palette [ALL DONE]
9. **P2 — Canvas hardcoded hex** — league-intel (DES-061), lab.js posColors (DES-062), verdict colors (DES-063)
10. **P2 — Gradient violations** — prompts.html (DES-064), lab.html sparkline (DES-065)
11. **P2 — Minor radius** — publish modal info box (DES-066)

### Emerging Patterns (updated DES-066)
- **Sub-minimum border-radius is the single most common design violation** — Cycles 1-6 have found it in: styles.css (7), lab-panels.css (171), lab.js (27), league-intel.html (16+6), 66 HTML pages (~300), formula-store.js (1), compare.html (2), pricing.html (3). Total: ~530 instances across the entire codebase. About 300 have been fixed; ~330 remain.
- **The fix pattern is always the same**: replace `border-radius:[0-7]px` with `var(--radius-sm)` or `8px`. Exception: inner bar fills use 6px to nest inside 8px tracks.
- **Canvas/JS code is the last frontier** — CSS-only fixes are largely done. Remaining issues are in JavaScript template literals and canvas drawing code. These require manual review since they're string-interpolated.
- **Hardcoded hex in canvas is a dark mode blocker** — lab.js has 14+ copies of the same posColors object, league-intel.html has 6 canvas hex values. All need to read from CSS variables.
- **Gradient violations are minor but absolute** — the design guide says "no gradients" and means it. Two found: a text overflow fade and a striped loading placeholder.
- **formula-store.js is a model of good practice** — 98% design-compliant. Other JS files should follow its pattern of using CSS variables in inline styles.
- **Things that are GOOD and should be preserved:**
  - Zero rogue font families (no sans-serif, arial, helvetica)
  - Zero generic "Loading..." text (all personality)
  - Zero gradients in CSS classes (only in 2 specific inline/pseudo-element cases)
  - Zero cold grays (except warroom pixel art)
  - Zero blue-black ink colors
  - 100% correct position colors in CSS
  - Dark mode CSS variables are all correctly defined
  - Agent SVG icons all exist
  - `getCanvasTheme()` pattern is the right architecture for canvas exports
  - warroom.js pixel art is cleanly isolated under the Situation Room dark exception
  - --text-on-accent contrast verified acceptable in both modes
  - All box-shadow:6px instances are on :hover states (correct per design guide)
  - formula-store.js uses CSS vars in 98% of inline styles

### What to Check Next (Cycle 7)
- lab.js: inline style `color:white`/`color:#fff` audit (separate from radius/hex)
- lab.js: box-shadow at rest audit (any 6px+ outside :hover?)
- Standalone HTML pages: `color:white`/`color:#fff` in `<style>` blocks (DES-042 covered CSS, but were they all fixed?)
- Dark mode rendering of Lab player profile modal — radius and shadow audit done (cycle 6), but color:white in modal content?
- Trade analyzer page: full dark mode walkthrough (verdict colors are one piece — what about the rest?)
- Canvas export PNG: does the watermark render correctly in dark mode?
- Whether DES-047 fix preserved intentional exceptions (scrollbar tracks, skeleton loaders)
- agents.html: does the pixel Situation Room have any non-pixel-art design violations?
- Mobile responsive audit of lab.js-generated panels (trade analyzer, roster builder, etc.)
- Any remaining `overflow:hidden` on data tables that truncate content on mobile
