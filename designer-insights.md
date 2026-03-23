## Designer Insights (updated ticket DES-056)

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

### Cycle 5 New Findings: JS-Generated Markup Is the Next Frontier
- **lab-panels.css has 171 sub-minimum border-radius instances** — this is 24x the size of the styles.css fix (DES-041, 7 instances). It's the single biggest token governance gap remaining.
- **JS-generated inline styles bypass the CSS design system** — lab-panels.js, league-intel.html JS, and formula-store.js all generate HTML with hardcoded values. CSS-only fixes can't reach this code.
- **league-intel.html has three separate issues** on the conversion pathway: sub-minimum radius (DES-048), wrong text-on-accent variable (DES-049), and broken hover-lift (DES-050).
- **Canvas code is well-architectured** — `getCanvasTheme()` in app.js handles bg/ink/white correctly. Only two minor issues found: `#ffffff` instead of `t.white` (charts.js) and `#fff` instead of `var(--text-on-accent)` (lab-panels.js heatmap).
- **warroom.js is clean** — all hex colors are for pixel art canvas rendering under the Situation Room always-dark exception. No design violations.
- **--text-on-accent contrast is acceptable** — verified both modes. Light mode white-on-orange = 3.1:1 (passes UI component threshold). Dark mode espresso-on-orange = 5.38:1 (passes AA).
- **color:var(--bg) vs color:var(--text-on-accent)** — league-intel.html JS badges use `var(--bg)` which gives sand-on-orange in light mode (poor contrast). Should be `var(--text-on-accent)` which gives white in light, espresso in dark.

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
- **Auth modal is the conversion gateway** — every registration and login passes through it. Orphaned shadow/radius values make it feel like a different product (DES-027, DES-028, FIXED)
- **Plan cards need hover-lift** — the pricing page is the decision point. Static cards don't invite interaction (DES-030, FIXED)
- **PNG exports ARE marketing** — compare page and Lab exports with hardcoded colors don't match dark mode (DES-034, FIXED)
- **Bureau connect card is the conversion engine's front door** — 3 design violations on the first thing a Sleeper-connected user sees (DES-043, FIXED)
- **Footer breaks on 71 pages at 375px** — mobile users from Twitter/Reddit hit broken footers everywhere (DES-037, FIXED)
- **Bureau hover-lift is broken** — league cards hover shadow = base shadow, no lift effect (DES-050, NEW)
- **Bureau badge contrast in light mode** — color:var(--bg) gives sand text on colored backgrounds (DES-049, NEW)

### Issue Categories by Impact
1. **P0 — Launch blockers** — OG image wrong tagline (DES-007) [DONE]
2. **P1 — Lab panel CSS governance** — 171 sub-minimum radius in lab-panels.css (DES-047)
3. **P1 — Bureau conversion path** — radius (DES-048), badge contrast (DES-049), hover-lift (DES-050)
4. **P1 — Mobile breaking** — footer minmax(140px) on 71 pages (DES-037) [DONE]
5. **P1 — Conversion gateway** — auth modal (DES-027, DES-028), plan cards (DES-030) [ALL DONE]
6. **P1 — Sitewide dark mode** — btn-primary (DES-017), nav (DES-018), auth (DES-019), chips (DES-020), cmd-palette (DES-029) [ALL DONE]
7. **P2 — JS inline style governance** — lab-panels.js hex in DOM (DES-051), heatmap #fff (DES-052), formula-store radius (DES-054)
8. **P2 — Canvas theme compliance** — charts.js #ffffff (DES-053)
9. **P2 — Compare page polish** — sub-minimum radius (DES-055), no hover-lift (DES-056)
10. **P2 — CSS token governance** — border-radius 10px (DES-038), 16px (DES-039), box-shadow 6px at rest (DES-040) [ALL DONE]
11. **P2 — Hardcoded text color** — lab-panels 96x (DES-032) [DONE], 69 HTML files 121x (DES-042) [DONE]
12. **P2 — Footer architecture** — no CSS class (DES-045), no semantic element (DES-046) [BOTH DONE]

### Emerging Patterns (updated DES-056)
- **JS-generated markup is the next frontier** — Cycles 1-4 fixed CSS-only issues. Cycle 5 reveals that JS code (lab-panels.js, league-intel.html, formula-store.js) generates HTML with hardcoded values that CSS-only fixes can't reach. The pattern: `style="...border-radius:4px..."` in template literals.
- **lab-panels.css 171-instance radius problem is the highest-leverage systemic fix** — one file, one find-replace pattern (with exceptions for bar fills). Fixes every Lab panel at once.
- **Bureau has accumulated design debt** — league-intel.html is the most feature-rich page but also the most design-inconsistent. Three separate tickets from one page (DES-048, 049, 050).
- **Canvas code is well-architectured but has two minor gaps** — getCanvasTheme() was the right pattern. Only `#ffffff`/`#fff` slipped through in two places.
- **Things that are GOOD and should be preserved:**
  - Zero rogue font families (no sans-serif, arial, helvetica)
  - Zero generic "Loading..." text (all personality)
  - Zero gradients (except acceptable skeleton loader)
  - Zero cold grays (except warroom pixel art)
  - Zero blue-black ink colors
  - 100% correct position colors
  - Dark mode CSS variables are all correctly defined
  - Agent SVG icons all exist
  - `getCanvasTheme()` pattern is the right architecture for canvas exports
  - warroom.js pixel art is cleanly isolated under the Situation Room dark exception
  - --text-on-accent contrast verified acceptable in both modes

### What to Check Next
- lab-panels.js: more JS-generated inline styles beyond the 7 hex instances found (full grep for style=" in template literals)
- league-intel.html: remaining `overflow:hidden` on table containers — any truncating data on mobile?
- lab.js: inline style color/radius/shadow audit (same pattern as lab-panels.js)
- Standalone panel pages (aging.html, breakouts.html, etc.) — do any still have page-specific CSS with sub-minimum values?
- Dark mode rendering of formula-store overlay (store-card backgrounds, search input)
- Player profile modal (lab.html) dark mode completeness — was color:white audit done but radius/shadow not?
- Whether the 171 lab-panels.css instances include any that were INTENTIONALLY smaller (scrollbar tracks, progress fill bars) — need exceptions list
- Trade analyzer page (if it exists as standalone) — design compliance
- Screener PNG export in dark mode — does watermark render with correct dark-mode colors?
