## Designer Insights (updated ticket DES-016)

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

### Issue Categories by Impact
1. **P0 — Launch blockers** — OG image wrong tagline (DES-007)
2. **P1 — Sitewide design violations** — ink-light color (DES-003), 1px borders (DES-010), logo font (DES-009), fake testimonials (DES-008)
3. **P2 — Sitewide consistency** — watermarks (DES-004), shadows (DES-012), border-radius (DES-011, DES-016)
4. **P2 — Copy/content issues** — panel count (DES-013), agent naming (DES-014), font spec mismatch (DES-015)
5. **P2 — Single-page layout bugs** — orphan chip (DES-001), mini-screener borders (DES-002)
6. **P2 — Footer/navigation** — prompts.html footer (DES-005), agent emojis (DES-006)

### Emerging Patterns (new this run)
- **Spec/code divergence** — DESIGN.md says one thing, code does another. DES-015 (nav/button fonts) and DES-003 (ink-light) are both cases where the spec and implementation disagree. Resolution may require updating the spec rather than the code.
- **Cross-page component inconsistency** — Same conceptual component (pricing card) rendered with different properties on different pages (DES-011). This happens when components are implemented as page-specific CSS rather than shared classes.
- **CSS token adoption gap** — Design tokens exist (--radius, --shadow-chunky) but aren't consistently used. Hardcoded values proliferate because tokens weren't enforced from the start.
- **Copy version drift** — Feature counts and descriptions drift between pages (60+ vs 70+, DES-013). No single source of truth for marketing copy.

### What to Check Next
- Lab sidebar rendering with backend running (need data to evaluate panel loading)
- Dark mode espresso flip across all main pages — does it look right everywhere?
- Compare page PNG export appearance (screenshot quality = marketing quality)
- Mobile responsive behavior on Lab sidebar and panel pages
- Player profile page (/player/{id}) — key for SEO and sharing
- Whether the OG image fix also needs og-image-lab.png updated
- Test the auth -> pricing -> checkout flow visually
- Check if Screener screenshot watermark uses the correct/latest brand copy
