## Designer Insights (updated ticket DES-026)

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
- Auth modal is well-styled — proper chunky borders, dark mode support, accessible focus states
- Agent SVG icons all exist at correct paths — no missing assets
- **Dark mode has a systemic `color: white` problem** — 9+ selectors use hardcoded white text with no `[data-theme="dark"]` override (DES-017 to DES-020)
- CSS variables for dark mode are correctly DEFINED — the gap is components not USING them
- No gradients, no cold grays, no blue-black ink anywhere — good discipline on banned patterns
- Position colors are 100% correct across all files — QB=blue, RB=teal, WR=terracotta, TE=purple
- Lab sidebar mobile behavior is correct (translateX hide at 768px) — one false alarm from code review
- `overflow-x: auto` is applied inconsistently — some panel tables have it, others use `overflow: hidden`

### What Matters Most for Conversion
- **OG image** is seen by more people than the home page itself — it's the preview on every social share
- Home page scroll path must be flawless — every section builds the "this is polished" impression
- **Fake testimonials will be caught** on r/DynastyFF — dynasty Reddit users verify everything
- Layout orphans (single wrapped elements on centered rows) undermine credibility
- The Screener is the growth engine — its pages need to be screenshot-worthy
- Mobile experience matters hugely since Twitter/Reddit traffic is mobile-heavy
- **Watermarks are the #1 brand exposure channel** — every shared screenshot carries them
- **CSS variable mismatches (DES-003) affect typographic hierarchy sitewide**
- Pricing page visual parity with home page matters — users bounce between them during conversion decision
- Panel count on pricing page (60+) undersells the actual product (67+ panels)
- **Dark mode must work perfectly** — power users toggle it, and broken dark mode = "unfinished product"
- **Pricing page at tablet widths** is a real conversion risk — iPad users are in the target demographic

### Issue Categories by Impact
1. **P0 — Launch blockers** — OG image wrong tagline (DES-007) [DONE]
2. **P1 — Sitewide dark mode** — btn-primary (DES-017), nav active (DES-018), auth tab (DES-019), chips (DES-020)
3. **P1 — Sitewide design violations** — ink-light color (DES-003), 1px borders (DES-010), logo font (DES-009), fake testimonials (DES-008) [ALL DONE]
4. **P2 — Dark mode panels** — tier descriptions (DES-021), medal colors (DES-022)
5. **P2 — Mobile responsive** — panel table scroll (DES-023), pricing grid (DES-024), footer grid (DES-025)
6. **P2 — Dark mode home** — inline styles bypass toggle (DES-026)
7. **P2 — Sitewide consistency** — watermarks (DES-004), shadows (DES-012), border-radius (DES-011, DES-016) [ALL DONE]
8. **P2 — Copy/content issues** — panel count (DES-013), agent naming (DES-014), font spec mismatch (DES-015) [ALL DONE]
9. **P2 — Single-page layout bugs** — orphan chip (DES-001), mini-screener borders (DES-002) [ALL DONE]
10. **P2 — Footer/navigation** — prompts.html footer (DES-005), agent emojis (DES-006) [ALL DONE]

### Emerging Patterns (updated DES-026)
- **Dark mode is the next frontier** — DES-017 through DES-022 and DES-026 are ALL dark mode issues. The CSS variable system is correctly defined, but adoption is incomplete. The pattern: hardcoded `color: white` on active/filled states that should use `var(--bg)` instead.
- **Spec/code divergence** — DESIGN.md says one thing, code does another. DES-015 (nav/button fonts) and DES-003 (ink-light) are both cases where the spec and implementation disagree. Resolution may require updating the spec rather than the code.
- **Cross-page component inconsistency** — Same conceptual component (pricing card) rendered with different properties on different pages (DES-011). This happens when components are implemented as page-specific CSS rather than shared classes.
- **CSS token adoption gap** — Design tokens exist (--radius, --shadow-chunky) but aren't consistently used. Hardcoded values proliferate because tokens weren't enforced from the start.
- **Copy version drift** — Feature counts and descriptions drift between pages (60+ vs 70+, DES-013). No single source of truth for marketing copy.
- **Mobile overflow pattern** — Some panels correctly use `overflow-x: auto` for mobile tables, others use `overflow: hidden`. The fix pattern is known; it just wasn't applied consistently across all 70+ panels.
- **Medal colors are ungoverned** — Gold (#ffd700) and bronze (#cd7f32) are used in 6 places with no CSS variable. Adding `--medal-gold` and `--medal-bronze` tokens would be a quick systemization win.

### What to Check Next
- Dark mode visual verification across all main pages (with browser — needs backend running)
- Auth -> pricing -> checkout flow in dark mode
- Player profile page (/player/{id}) dark mode
- Whether the home page Situation Room demo section intentionally stays dark or should flip
- Mobile responsive behavior on individual panels (not just the sidebar)
- Compare page PNG export appearance (screenshot quality = marketing quality)
- Check if Screener screenshot watermark uses the correct/latest brand copy
- Production deployment (currently 502) — need to verify before shipping more fixes
