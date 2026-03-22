## Designer Insights (updated ticket DES-004)

### Patterns Found
- Home page layout is mostly polished — chunky borders, correct colors, proper font usage
- The design guide is well-followed across pages (sand bg, espresso ink, offset shadows)
- Mobile nav is tight but functional — dark mode toggle has minimal right margin
- 404 page is excellent — on-brand voice, clean layout, proper navigation back
- Agent bio cards on home page use dark Situation Room aesthetic effectively
- League Intel connection page is clean and well-structured
- **Sitewide consistency issues are more impactful than single-page bugs** — DES-003 (ink-light) and DES-004 (watermarks) affect 15+ pages each
- Pages built in different phases have slightly different CSS conventions (page-specific class prefixes, inline styles vs classes)
- The consolidation redirect pattern (standalone → lab.html?panel=X) is working but footer still links to standalone URLs

### What Matters Most for Conversion
- Home page scroll path must be flawless — every section builds the "this is polished" impression
- Layout orphans (single wrapped elements on centered rows) undermine credibility
- The Screener is the growth engine — its pages need to be screenshot-worthy
- Mobile experience matters hugely since Twitter/Reddit traffic is mobile-heavy
- **Watermarks are the #1 brand exposure channel** — every shared screenshot carries them. Inconsistency here = inconsistent brand impression across thousands of Reddit views
- **CSS variable mismatches (DES-003) affect typographic hierarchy sitewide** — labels and metadata look too dark, reducing visual clarity

### Issue Categories by Impact
1. **Sitewide CSS variable mismatches** (P1) — one fix, many pages improved
2. **Sitewide consistency issues** (P2) — watermarks, border styles, class naming
3. **Single-page layout bugs** (P2-P3) — orphan chips, wrapping issues
4. **Content/copy issues** (P3) — fake testimonials, agent name mismatches

### What to Check Next
- Individual Lab panel pages with backend running (need actual data to evaluate)
- Dark mode toggle behavior across all pages — does the espresso flip look right?
- Compare page layout and PNG export appearance (screenshot quality = marketing quality)
- Footer consistency across pages (are all 5 columns identical everywhere?)
- Mobile responsive behavior on the Lab sidebar and panel pages
- Player profile page (/player/{id}) — key for SEO and sharing
- 1px solid border pattern on data rows — appears in compare.html, tradevalues.html too (same as DES-002)
