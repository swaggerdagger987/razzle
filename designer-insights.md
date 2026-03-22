## Designer Insights (updated ticket DES-046)

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
- **Auth modal is the conversion gateway** — every registration and login passes through it. Orphaned shadow/radius values make it feel like a different product (DES-027, DES-028)
- **Plan cards need hover-lift** — the pricing page is the decision point. Static cards don't invite interaction (DES-030)
- **PNG exports ARE marketing** — compare page and Lab exports with hardcoded colors don't match dark mode (DES-034)
- **Bureau connect card is the conversion engine's front door** — 3 design violations on the first thing a Sleeper-connected user sees (DES-043)
- **Footer breaks on 71 pages at 375px** — mobile users from Twitter/Reddit hit broken footers everywhere (DES-037)

### Issue Categories by Impact
1. **P0 — Launch blockers** — OG image wrong tagline (DES-007) [DONE]
2. **P1 — Mobile breaking** — footer minmax(140px) on 71 pages (DES-037), Bureau connect card off-spec (DES-043)
3. **P1 — Conversion gateway** — auth modal shadow 8px (DES-027), auth modal radius 16px (DES-028), plan cards no hover (DES-030) [ALL DONE]
4. **P1 — Sitewide dark mode** — btn-primary (DES-017), nav active (DES-018), auth tab (DES-019), chips (DES-020) [ALL DONE], cmd palette #fff (DES-029) [DONE]
5. **P1 — Sitewide design violations** — ink-light color (DES-003), 1px borders (DES-010), logo font (DES-009), fake testimonials (DES-008) [ALL DONE]
6. **P2 — CSS token governance (THE SYSTEMIC THEME)** — border-radius 10px (DES-038, 50+ instances), 16px (DES-039, 3 pages), 3px/6px (DES-041, 7 elements), box-shadow 6px at rest (DES-040, 30+ components), pricing radius (DES-044)
7. **P2 — Hardcoded text color** — lab-panels 96x color:#fff (DES-032) [DONE], 69 HTML files 121x color:white (DES-042), diff-mode label (DES-033) [DONE]
8. **P2 — Footer architecture** — no CSS class (DES-045), no semantic element (DES-046) — root cause of DES-037
9. **P2 — Conversion page polish** — elite CTA inline style (DES-035) [DONE], pricing badges radius (DES-031) [DONE]
10. **P2 — Export quality** — compare.js hardcoded hex (DES-034) [DONE]
11. **P2 — Dark mode panels** — tier descriptions (DES-021), medal colors (DES-022) [DONE]
12. **P2 — Mobile responsive** — panel table scroll (DES-023), pricing grid (DES-024), footer grid (DES-025) [ALL DONE]

### Emerging Patterns (updated DES-046)
- **CSS token governance is the dominant systemic issue now** — Cycles 1-3 fixed individual color/dark-mode bugs. Cycle 4 reveals that the DESIGN SYSTEM EXISTS (tokens are defined) but is UNDERENFORCED (code uses magic numbers). 10px radius (50+), 6px shadow at rest (30+), color:white (217 total). The tokens are there. The code doesn't use them.
- **Footer architecture is the maintenance bottleneck** — DES-037 (71 pages need minmax fix) exists because DES-045 (no CSS class). Every future footer change requires 72 file edits. This is the root cause, not a symptom.
- **The 72-page duplication problem** — Footer, position badge colors, border-radius, box-shadow — all duplicated per-page rather than shared. This is the architectural debt ceiling. Fixing it once (shared CSS classes) prevents the next 10 tickets.
- **Conversion path cleanup is nearly complete** — DES-027 through DES-035 covered auth modal, pricing page, and plan cards. DES-043 (Bureau connect card) and DES-044 (promo input) are the remaining items.
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

### What to Check Next
- Formula store page (formula-store.js generates UI — any inline style issues?)
- Screener PNG export in dark mode (does watermark + background render correctly?)
- Chart canvas exports across panel pages (same pattern as compare.js DES-034?)
- Whether skeleton loader gradient (lab.html) looks correct in dark mode
- about.html footer links to standalone pages — do redirects work?
- Compare page responsive behavior on mobile
- agents.html (Situation Room) pixel canvas rendering on different viewport sizes
- Dark mode on league-intel.html Bureau sections (odds cards, manager profiles)
- Whether `--text-on-accent: var(--bg)` actually works for dark mode badges on vibrant accents (contrast check)
