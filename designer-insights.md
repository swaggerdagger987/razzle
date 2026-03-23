## Designer Insights (updated ticket DES-076)

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

### Issue Categories by Impact
1. **P1 — DOM tier/grade hardcoded hex** — DES-067, DES-068 (easy CSS var swap, no architecture change)
2. **P2 — Canvas architecture** — DES-069 (keystone fix), then DES-070-072 (downstream cleanup)
3. **P2 — Consistency bug** — DES-073 (elite+premium same color in 1 of 3 tier definitions)
4. **P2 — Design rule compliance** — DES-074 (gradient), DES-076 (skeleton radius)
5. **P2 — Mobile UX** — DES-075 (panel table scroll on mobile)

### Emerging Patterns (updated DES-076)
- **Canvas hardcoded hex is now the dominant remaining issue** — ~30 hex color references in canvas code that could read from CSS vars if getCanvasTheme had accent properties.
- **The codebase has matured significantly** — color:white is zero, sub-minimum radius is down to intentional bar fills, no rogue fonts, no generic loading text, no cold grays.
- **DRY violations in lab.js** — tier/grade colors defined 6+ times, some with inconsistent values. posColors was consolidated (DES-062) — same pattern needed for tier/grade.
- **The fix pattern for canvas hex**: (1) Add accent colors to getCanvasTheme, (2) Replace hardcoded hex with theme properties. Same approach that worked for posColors.
- **Standalone pages are in good shape** — redirect to Lab works, dark mode inherits from CSS vars. Only mobile overflow-x is missing.
- **Things that are GOOD and should be preserved:**
  - Zero rogue font families (confirmed cycle 7)
  - Zero generic "Loading..." text (confirmed cycle 7)
  - Zero gradients in CSS classes (2 inline cases were fixed)
  - Zero cold grays (confirmed cycle 7)
  - Zero blue-black ink colors (confirmed cycle 7)
  - Zero color:white/color:#fff in lab.js or HTML pages (confirmed cycle 7)
  - Zero 1px borders in lab.js (confirmed cycle 7)
  - 100% correct position colors via _POS_COLORS_CSS + _getPosColorsHex()
  - Dark mode CSS variables all correctly defined
  - Agent SVG icons all exist
  - getCanvasTheme() pattern correctly used for bg/ink (just needs accent extension)
  - warroom.js pixel art cleanly isolated under Situation Room dark exception
  - --text-on-accent contrast verified acceptable in both modes
  - Heat map (getHeatColor) is dark-mode aware
  - Watermark (drawRazzleWatermark) is dark-mode aware
  - formula-store.js 98% design-compliant (1 issue fixed)
  - All box-shadow:6px instances are on :hover states (correct per design guide)

### What to Check Next (Cycle 8)
- After DES-069 is fixed: verify all canvas exports render correct accent colors in dark mode
- After DES-067/068: verify draft class and trade value panels look correct in dark mode
- After DES-075: verify mobile scroll on panel tables at 375px viewport
- Lab sidebar panel navigation: does switching between panels preserve dark mode correctly?
- Canvas export file sizes: are PNGs reasonable for sharing on Reddit/Twitter?
- Accessibility: ARIA labels on tier badges, grade badges, position badges
- Performance: do the 40+ standalone pages load efficiently as Lab panel iframes?
- Whether consolidated _POS_COLORS_CSS is used everywhere or if any new code has regressed
- Print CSS: cheatsheet.html has @media print styles — do any other panels need print support?
