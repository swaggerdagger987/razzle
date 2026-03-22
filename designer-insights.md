## Designer Insights (updated ticket DES-036)

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
- **Dark mode has a systemic `color: white` problem** — 9+ selectors in styles.css (DES-017 to DES-020, now fixed) PLUS 96 instances in lab-panels.css (DES-032, new)
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

### Issue Categories by Impact
1. **P0 — Launch blockers** — OG image wrong tagline (DES-007) [DONE]
2. **P1 — Conversion gateway** — auth modal shadow 8px (DES-027), auth modal radius 16px (DES-028), plan cards no hover (DES-030)
3. **P1 — Sitewide dark mode** — btn-primary (DES-017), nav active (DES-018), auth tab (DES-019), chips (DES-020) [ALL DONE], cmd palette #fff (DES-029)
4. **P1 — Sitewide design violations** — ink-light color (DES-003), 1px borders (DES-010), logo font (DES-009), fake testimonials (DES-008) [ALL DONE]
5. **P2 — CSS token adoption** — lab-panels 96x color:#fff (DES-032), nav-plan-badge 4px radius (DES-036), diff-mode label (DES-033), pricing badges (DES-031)
6. **P2 — Dark mode panels** — tier descriptions (DES-021), medal colors (DES-022) [DONE]
7. **P2 — Conversion page polish** — elite CTA inline style (DES-035), pricing badges radius (DES-031)
8. **P2 — Export quality** — compare.js hardcoded hex (DES-034)
9. **P2 — Mobile responsive** — panel table scroll (DES-023), pricing grid (DES-024), footer grid (DES-025) [ALL DONE]
10. **P2 — Dark mode home** — inline styles bypass toggle (DES-026) [DONE]

### Emerging Patterns (updated DES-036)
- **Conversion path is the new frontier** — DES-027, DES-028, DES-030, DES-031, DES-035 are all pricing/auth issues. The conversion funnel has accumulated design debt that needs systematic cleanup.
- **CSS token adoption gap persists** — DES-031 (badge radius), DES-032 (badge text color), DES-033 (diff label), DES-036 (nav badge radius) all share the same root cause: hardcoded values instead of CSS variables. The design system tokens exist but aren't enforced.
- **Dark mode color:#fff is a systemic issue** — 96 instances in lab-panels.css alone (DES-032). Previous fixes (DES-017 to DES-020) addressed styles.css but the panel CSS was untouched. Fix pattern: introduce `--text-on-accent` variable, bulk replace.
- **Canvas exports are a parallel dark mode problem** — CSS variables don't apply to canvas. The `getCanvasTheme()` system in app.js is the right approach, but compare.js and other files don't fully use it (DES-034).
- **Spec/code divergence** — DESIGN.md says one thing, code does another. DES-015 (nav/button fonts) and DES-003 (ink-light) were both cases where the spec and implementation disagreed. Resolution may require updating the spec rather than the code.
- **Cross-page component inconsistency** — Same conceptual component (pricing card) rendered with different properties on different pages (DES-011). This happens when components are implemented as page-specific CSS rather than shared classes.
- **Orphaned values cluster around the auth modal** — 16px radius and 8px shadow are both unique to the auth modal. No other component uses these values. This suggests the modal was built in a rush or before the design system was finalized.
- **Inline styles on the pricing page** — Elite CTA and JS-generated banners both use `style=` attributes. This is the conversion page — it should have the tightest CSS governance, not the loosest.

### What to Check Next
- Bureau pages in dark mode (league-intel.html, bureau sections)
- Formula Store page (formula-store.html) — user-generated content display
- Player standalone page (/player/{id}) — deep-link from search engines
- Whether auth modal dark mode actually works visually (vars cascade but no explicit override)
- Mobile responsive on pricing page AFTER DES-024 fix (verify 2-col works)
- Screener PNG export in dark mode (does watermark render correctly?)
- Chart canvas exports across all panel pages (same pattern as compare.js DES-034?)
- About page styling consistency
- Whether skeleton loader gradient (lab.html) looks correct in dark mode
