## Designer Insights (updated ticket DES-286)

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

### Cycle 20 Findings: Hover Interactions, Contrast Compliance, Platform Adaptation, CSS Governance

- **Home page feature-card, social-card, pricing-card have ZERO :hover states** (DES-207) — DESIGN.md says "hover-lift — interaction should feel physical." Smart chips on the same page HAVE hover. Pricing page plan-cards HAVE hover. The 3 card types on the #1 conversion page are dead flat. Easy fix: 6 lines of CSS.
- **Demo briefing card text is near-invisible in light mode** (DES-208) — P1. `color: var(--ink-medium)` (#5c4a3d) on `background: var(--bg-ink)` (#1a110a) produces ~2:1 contrast. WCAG AA requires 4.5:1. Works fine in dark mode because `--ink-medium` flips to lighter value. But light mode (the default for first visitors) is broken. These cards sell the Situation Room premium product.
- **btn-hero:hover shadow unchanged from base** (DES-209) — hover adds translate(-2px, -2px) but shadow stays 4px. DESIGN.md says 6px on hover. The pricing page plan-card gets this right.
- **Nav user dropdown has zero accessibility** (DES-210) — no aria-expanded, no Escape close, no role="menu". The hamburger menu on the SAME page IS fully accessible. The dropdown is how paid users access subscription management.
- **font-size:10px — 475 instances across 75 files** (DES-211) — DES-197 covers 9px (141 instances). 10px is even more pervasive and still below the type scale minimum (11px). Heaviest in lab-panels.css (125), lab.html (43), league-intel.html (45).
- **Feature card icons are platform-dependent emoji** (DES-212) — 📊🧮📸🔗 render differently on Apple/Google/Samsung/Windows. Same class of issue as DES-174 (hero mascot emoji). The first feature section on the home page looks different depending on the visitor's OS.
- **overflow-x:hidden on html/body at 480px** (DES-213) — index.html and pricing.html both mask horizontal overflow instead of fixing it. If content exceeds viewport width at 375px, users can't scroll to see it.
- **Safari VoiceOver strips list semantics** (DES-214) — 12 `list-style:none` `<ul>` elements with zero `role="list"`. Includes main nav (75 pages) and pricing plan-features (conversion page). Safari VoiceOver intentionally removes list semantics from unstyled lists.
- **Search hint "Ctrl+K" doesn't adapt to Mac** (DES-215) — the keyboard handler correctly uses `ctrlKey || metaKey`, but the display text hardcodes "Ctrl+K" on all platforms. Mac users (significant portion of 22-40 tech audience) see the wrong modifier key.
- **4+ inline-style grids on home page prevent media/dark mode overrides** (DES-216) — feature grid, discovery chips, social proof grid, and mini-screener tabs all use inline `style` attributes. Can't be targeted by `@media` or `[data-theme="dark"]` without `!important`. Same pattern as DES-188 (pricing grid inline) and DES-196 (pricing trial sections).

### Things confirmed GOOD in cycle 20:
- **Theme-color meta updates dynamically** — `_updateThemeColor()` correctly switches between #ede0cf (sand) and #2d1f14 (espresso) on theme toggle and OS preference change.
- **OS dark mode preference detection works** — `prefers-color-scheme: dark` media query listener exists and functions correctly when no manual preference is saved.
- **All external links have `rel="noopener"`** — verified 4/4, no regression from DES-148 fix.
- **Hamburger mobile menu is fully accessible** — aria-expanded, Escape handler, focus return, inert on main content. Production-quality implementation.
- **All `<script>` tags on lab.html use `defer`** — lab.js, formulas.js, formula-store.js, charts.js, lab-panels.js all correctly deferred (only app.js remains blocking per DES-167).
- **Scroll listeners use `{ passive: true }`** — only 2 scroll listeners in JS, both correctly passive.
- **Zero `window.addEventListener('resize', ...)` in frontend JS** — no resize handlers that could cause jank.
- **requestAnimationFrame used** (26 instances across 5 files) — proper animation frame scheduling.
- **Heading hierarchy correct** — index.html (h1 + 6 h2s), pricing.html (h1 + 3 h2s), both well-structured.
- **CSS variables handle dark mode on home page** — feature-card, social-card, pricing-card all use var() tokens that flip correctly. The demo-card is the only contrast failure.
- **`escapeHtml()` used consistently** — innerHTML operations properly escape user data.

### Cycle 21 Findings: Conversion Copy, Undefined CSS Classes, Context Continuity

- **"free API key (~$1-3/mo)" is self-contradictory** (DES-217) — P0. Appears on home page Pro card, pricing page Pro card, and pricing explainer chip. "Free" followed by a cost creates cognitive dissonance. Users see hidden costs. The FAQ explains it correctly but the card copy (first thing users read) confuses. This is the highest-priority finding — confusing pricing = lost signups.
- **Pro feature list differs between home and pricing page** (DES-218) — P1. Home page lists "Bureau deep-dive", "Championship probability" — absent from pricing page. Pricing page lists "Roster grading", "League-contextualized agents" — absent from home page. Users who check both pages get confused. The feature matrix on pricing.html is correct — the card-level summaries disagree.
- **`.btn` and `.btn-outline` have ZERO CSS definition** (DES-219) — P1. Used on 8 pages. `.btn-primary` IS defined and works. But 4 pages (breakdown, regression, strengths, weeklyleaders) use `class="btn btn-outline"` — neither class exists. Export PNG and retry buttons render as browser defaults. awards.html correctly uses `btn-chunky` — inconsistent pattern.
- **18+ standalone pages generate headshot <img> without width/height** (DES-220) — P2. CSS classes define dimensions but HTML attributes are missing → CLS. The shared `playerHeadshot()` in app.js DOES include width/height — standalone pages duplicate the pattern without it. DES-200 covered tradefinder.html only.
- **Duplicate "leaguemates don't know about yet" on home page** (DES-221) — P2. Same phrase at line 731 (subtitle) and 746 (Caveat annotation). Caveat should be a personality aside that ADDS something, not an echo. Reads as copy-paste error.
- **lab-panels.js search inputs missing aria-label** (DES-222) — P2. `searchWrapHTML()` generates 8+ search inputs with only placeholder text. Standalone pages like breakdown.html correctly use aria-label — the flagship Lab panels don't.
- **innerHTML += for select option building** (DES-223) — P2. 18 instances in lab-panels.js. Each += forces serialize → concatenate → reparse cycle. Build string first, assign once.
- **pricing-badge rotate(-2deg) inconsistent with DESIGN.md** (DES-224) — P2. DES-142 fixed rotate(2deg) in styles.css but missed page-specific `<style>` blocks on index.html and pricing.html. The same page has -2deg on save-badge and 3deg on elite badge.
- **prompts.html + tools.html have zero dark mode page CSS** (DES-225) — P2. Only lab.html and pricing.html have [data-theme="dark"] rules in their page `<style>` blocks. Both pages use CSS vars that auto-flip — needs visual verification.
- **Mini-screener rows link to generic /lab.html** (DES-226) — P2. All 15 rows `onclick="window.location='/lab.html'"`. User clicks "Patrick Mahomes" → lands on empty screener. Context dropped at peak curiosity. Should link to `/lab.html?search=PlayerName`.

### Things confirmed GOOD in cycle 21:
- `box-sizing: border-box` universal via `* {}` reset — no box model issues
- All preconnect hints for Google Fonts present on all 75 pages
- `razzleError()` personality text used consistently across all error states — no "Error loading data" anywhere
- Home page mini-screener POS_COLORS use `var()` CSS tokens (not hardcoded hex) — good
- Error fallback on mini-screener well-handled: "couldn't reach the film room" with link to Screener
- Pricing FAQ is comprehensive (9 Q&A), well-written, and accurately explains BYOK vs Elite
- About page uses CSS vars throughout — should auto-flip cleanly in dark mode
- No `localStorage.getItem` calls without try/catch found in critical paths
- No duplicate HTML IDs found on home page
- No `innerHTML +=` outside of select option building (18 instances) — other DOM updates use `innerHTML =`

### Audit Dimension Evolution
- Cycles 1-7: CSS consistency (borders, radius, shadows, colors, dark mode)
- Cycle 8: Accessibility (ARIA, focus), SEO (h1, canonical), dark mode exports
- Cycles 9-11: Deep accessibility (combobox, aria-live, canvas ARIA, tables)
- Cycles 12-14: Conversion path, agent connective tissue, mobile UX
- Cycles 15-16: Performance (memory leaks, lazy loading), semantics, brand
- Cycles 17-18: Mobile touch targets, dark mode native controls, CSS governance
- Cycles 19-20: Type scale violations, hover interactions, platform adaptation
- Cycle 21: Conversion COPY — not just visual, but the words that sell
- **Cycle 22: Auth flow + onboarding friction — the funnel BETWEEN pages**
- **Cycle 23: Content architecture, copy accuracy & handwritten type scale**

### Key Insight: The Auth Flow Is Unfinished
Cycle 22 reveals that the auth/onboarding flow — the critical path from "curious visitor" to "paying user" — has fundamental gaps:
- No password recovery at all (DES-227) — P0 blocker
- No trial incentive visible at the moment of registration decision (DES-228)
- Anxiety-inducing copy at the Sleeper connection step (DES-229)
- Post-checkout copy mismatch undermines trust at the highest-stakes moment (DES-230)
- No legal/privacy linkage where users provide credentials (DES-231)
These aren't CSS polish issues. They're the conversion funnel itself — the exact steps a user takes to go from free to paid. Every gap here is a lost user.

### Key Insight: Copy Accuracy Is a Design Issue
Previous cycles focused on visual and structural quality. Cycle 21 reveals that COPY ACCURACY is equally important:
- "free API key" + cost = confusion (DES-217)
- Different features on different pages = mistrust (DES-218)
- Duplicate phrases = unpolished (DES-221)
- Context-free links = lost curiosity (DES-226)
These are "design" issues in the broadest sense — they affect the user's experience at decision points.

### Cycle 22 Findings: Auth Flow, Conversion Friction, Onboarding Polish
- **No "Forgot Password" flow** (DES-227) — P0. The auth modal has Sign In + Register tabs, ZERO password recovery. Users who forget their password are permanently locked out. Every SaaS product has this. The backend has no /api/auth/reset-password endpoint.
- **Register form has no trial incentive copy** (DES-228) — P1. The moment a user decides to create an account, there's zero mention of the 7-day Pro trial. Every other surface (home page, pricing, upgrade gate) features it prominently. The register form says: email + password + confirm + Create Account. Add "includes 7-day Pro trial. no credit card."
- **Sleeper prompt says "permanently"** (DES-229) — P1. "this will permanently link your Sleeper account" creates loss aversion at the critical Sleeper connection step. The behavior (one Sleeper per account) is fine — the copy is punitive.
- **Welcome modal says "60+ panels" — marketing says 70+** (DES-230) — P1. Post-checkout modal (app.js:774,781) shows "All 60+ analytical panels". DES-156 fixed the same issue in the upgrade gate but missed the welcome modal. Users just paid — copy mismatch at this moment erodes trust.
- **Auth modal has no Privacy/Terms link** (DES-231) — P1. Users provide email+password with zero legal context. About page HAS a Privacy section (6 bullet points). The auth modal has zero linkage. Stripe compliance also requires accessible terms.
- **"See full feature comparison" link doesn't anchor to matrix** (DES-232) — P2. Home page link goes to /pricing.html top. The matrix is below 6 sections of content the user already saw.
- **Pricing FAQ questions are div not h3** (DES-233) — P2. 9 Q&A items look like headings but are plain divs. Screen readers can't navigate to them. Breaks heading hierarchy. Hurts SEO potential for rich FAQ snippets.
- **Pricing sections missing id for deep links** (DES-234) — P2. Feature matrix, FAQ, and free celebration sections have no id attributes. Can't be linked to from external sources (Reddit, group chats).
- **About page Contact missing Twitter handle** (DES-235) — P2. Primary distribution channel (Phase 1 roadmap) not discoverable on the page linked from every footer.
- **Nav dropdown email + caret at 10px** (DES-236) — P2. .nav-dropdown-header and .nav-user-caret both 10px, below the 11px type scale minimum. User identity touchpoint for logged-in users.

### Things confirmed GOOD in cycle 22:
- Auth modal has proper autocomplete attributes (email, current-password, new-password)
- Password inputs use type="password" correctly
- Button disable in handleLogin/handleRegister prevents double-submit
- Nav dropdown close-on-outside-click works correctly (_dropdownCloseHandler)
- Auth error messages are generic — no account enumeration ("fumbled the login" not "email not found")
- Sleeper link error handling includes locked_username case with specific message
- showWelcomeState() CTA links use correct absolute paths (/agents.html, /lab.html)
- All target="_blank" links have rel="noopener" — verified in this cycle
- 404 page has complete meta tags (og:title, og:url, canonical, twitter:image:alt)
- About page has canonical URL and og:url correctly set

### Cycle 23 Findings: Content Architecture, Copy Accuracy & Handwritten Type Scale
- **Caveat font used at 14px or below in 97 instances across 44 files** (DES-237) — P2. DESIGN.md minimum is 18px for smaller notes, 24px for annotations. 74 instances at 14px, 23 at 12-13px. Heaviest in league-intel.html (26), standalone watermarks (20+), lab.html (3), agents.html (4). Handwritten personality layer is too small to read.
- **19 pages use `<div>` instead of `<main>` landmark** (DES-238) — P2. Skip links work (target #main-content) but screen readers don't announce div as landmark. 56 pages are correct; 19 use div. Includes player.html, compare.html, team.html — high-traffic pages.
- **Year cap 2025 in app.js:1772** (DES-239) — P1. `Math.min(getFullYear(), 2025)` shows wrong year in console Easter egg. One-line fix.
- **"Social proof" section is feature marketing, not proof** (DES-240) — P1. HTML comment says "Social proof", class is "social-card", h2 references r/DynastyFF — but 3 cards are feature benefits (screener, export, nflverse). `.social-card-user` CSS class exists but unused — social proof was designed but never implemented. Missing credibility signal on #1 conversion page.
- **"70+ panels (preview)" misleads free users** (DES-241) — P1. pricing.html lines 250, 357. Free users see lock icons, not previews. "Preview" creates false expectation.
- **Footer has no Twitter link on 73 pages** (DES-242) — P1. Footer says "made for Reddit" + links to about.html. Zero Twitter presence. Phase 1 is Twitter launch — primary distribution channel is invisible from every page. Separate from DES-235 (about page Contact section).
- **warroom.js:1652 hardcoded "2025 rookie draft class"** (DES-243) — P2. Situation Room sample prompt shows stale year.
- **Home page CTA buttons have 80+ char inline onclick** (DES-244) — P2. Lines 822, 839. Duplicates logic from app.js startCheckout/handleCheckout. Fragile, untestable. _updateHomeCTAs() at line 921 already manages these buttons via addEventListener — the onclick should use the same pattern.
- **Easter egg promo codes siloed to pricing.html** (DES-245) — P2. RAZZLEDAZZLE/TIGER/GOAT defined in pricing.html only. app.js validatePromoCode() doesn't know them.
- **Mini-screener has no loading skeleton** (DES-246) — P2. Single "pulling film..." text line while API loads. Lab screener has proper skeleton. Home page first impression depends on this section looking alive.

### Things confirmed GOOD in cycle 23:
- Checkout interval format (pro_year/elite_year) is correctly handled by billing.py — NOT a bug
- Console.log Easter eggs (razzle.help(), tiger ASCII art) are intentional and well-implemented
- Zero tabindex>0 values anywhere — clean tab order
- All images have alt attributes (55 intentionally empty for decorative images — correct per WCAG)
- No duplicate HTML IDs on any page
- Skip links exist on all 75 pages targeting #main-content
- _updateHomeCTAs() properly handles paid/trial/expired states with CTA text updates
- All 56 `<main>` tag pages are correctly structured
- billing.py docstring explicitly documents interval format: pro_month, pro_year, elite_month, elite_year, ea_*, lifetime_*

### Key Insight: Content Architecture Is a Design Issue
Cycle 23 reveals that CONTENT STRUCTURE matters as much as visual structure:
- "Social proof" that isn't social proof is worse than no section at all — it's a missed opportunity AND it reads as dishonest to the r/DynastyFF audience
- "Preview" copy that doesn't match reality creates trust gaps at conversion decision points
- Footer social links should match the active distribution channel, not aspirational ones
- Personality text (Caveat) below its readable size defeats the purpose of having it
These are all one-line fixes in terms of code, but they're high-impact for user trust and conversion.

### Cycle 24 Findings: Performance UX, Mobile Platform, Conversion Infrastructure

- **Home page mini-screener fetch has no timeout** (DES-247) — P1. The `/api/players` fetch at index.html:1018 has no AbortController or setTimeout. DES-150 covers the Lab screener timeout — this is a DIFFERENT code path on the HOME PAGE. Mobile users on slow connections (62% of traffic) see "pulling film..." indefinitely.
- **Zero @media print rules in styles.css** (DES-248) — P2. Nav, footer, watermark, dark mode all render when printing. Only cheatsheet.html has print CSS. Noted in cycle 9 audit but never ticketed.
- **btn-elite:hover shadow 3px — LESS than base 4px** (DES-249) — P2. Pricing page line 166. The Elite CTA ($149.99/yr button) shrinks on hover instead of lifting. Plan cards on the same page correctly do 4px → 6px.
- **Zero preload hints for critical resources** (DES-250) — P2. No `<link rel="preload">` for styles.css, app.js, or font CSS on any of 75 pages. Browser discovers resources late. Free performance win.
- **No viewport-fit=cover or safe-area padding** (DES-251) — P2. Zero instances of `env(safe-area-inset-*)` in entire frontend. iPhone notch/Dynamic Island can obscure content in landscape or PWA mode.
- **JSON-LD missing WebSite+SearchAction** (DES-252) — P2. Only WebApplication schema exists. Missing the schema that enables Google sitelinks search box — free SERP real estate.
- **Mini-screener fetch omits season parameter** (DES-253) — P2. Home page fetch relies on backend default season. No "2025 Season" label visible. During offseason, unclear which season's data is shown.
- **Zero private support contact anywhere** (DES-254) — P1. No email, no form, no DM channel besides one Twitter mention on pricing page. Users with billing issues or locked accounts (DES-227) have no support path. Stripe compliance risk.
- **Pricing interval toggle not in URL** (DES-255) — P2. Monthly/yearly toggle changes prices but URL stays `/pricing.html`. Share link always shows yearly. State lost on refresh.
- **Mini-screener tabs missing ARIA tablist** (DES-256) — P2. Position filter buttons (ALL/QB/RB/WR/TE) have no role="tablist", no aria-selected, no keyboard arrow navigation. First interactive element visitors encounter.

### Things confirmed GOOD in cycle 24:
- `apiFetch()` correctly handles 401 — wipes stale token and opens auth modal
- Theme toggle correctly syncs between desktop and mobile panel
- Google Fonts use `display=swap` — FOUT handled
- `sitemap.xml` and `robots.txt` dynamically generated by FastAPI backend — no static file needed
- Google Fonts preconnect hints present on all pages
- Mini-screener `.catch()` shows branded error fallback with link to full Screener
- `_updateHomeCTAs()` correctly handles all tier states (free/trial/paid/expired/elite)
- Dark mode overlay uses warm espresso rgba — not cold black (DES-140 was fixed)

### Key Insight: Infrastructure Gaps Are Now the Biggest Risk
Cycle 24 shifts from CSS/visual polish (cycles 1-7), accessibility (8-11), content accuracy (21-23) to INFRASTRUCTURE gaps that affect conversion:
- No support contact + no forgot password = paying users literally locked out with no recourse
- No fetch timeout on home page = broken first impression on mobile
- No preload hints = slower LCP on every page
- No safe-area padding = content hidden on modern iPhones
These aren't design issues in the traditional sense — they're the plumbing that converts visitors into users. A beautiful page that loads slowly, breaks on iPhone, and has no support contact still loses customers.

### Audit Dimension Evolution (updated)
- Cycles 1-7: CSS consistency (borders, radius, shadows, colors, dark mode)
- Cycle 8: Accessibility (ARIA, focus), SEO (h1, canonical), dark mode exports
- Cycles 9-11: Deep accessibility (combobox, aria-live, canvas ARIA, tables)
- Cycles 12-14: Conversion path, agent connective tissue, mobile UX
- Cycles 15-16: Performance (memory leaks, lazy loading), semantics, brand
- Cycles 17-18: Mobile touch targets, dark mode native controls, CSS governance
- Cycles 19-20: Type scale violations, hover interactions, platform adaptation
- Cycle 21: Conversion COPY — not just visual, but the words that sell
- Cycle 22: Auth flow + onboarding friction — the funnel BETWEEN pages
- Cycle 23: Content architecture, copy accuracy & handwritten type scale
- **Cycle 24: Performance UX, mobile platform, conversion infrastructure**
- **Cycle 25: Distribution infrastructure — Twitter cards, sharing, OG images, conversion fast paths**

### Cycle 25 Findings: Distribution Infrastructure, Twitter Cards, Sharing, Conversion Fast Paths

- **Zero twitter:site / twitter:creator on all 75 pages** (DES-257) — P1. Phase 1 is Twitter launch. Every shared link creates a Twitter Card but doesn't attribute it to @razzle_lol. Free account attribution on every share — missing from every page. Two meta tags per page, 75 pages.
- **Pricing page has zero JSON-LD structured data** (DES-258) — P2. Index.html has WebApplication schema. pricing.html (the conversion page) has nothing. 9 FAQ items could enable Google rich FAQ snippets. 3 pricing tiers could enable Product/Offer rich results. Free SERP real estate.
- **No navigator.share() for mobile sharing** (DES-259) — P2. All share flows use clipboard-only. Mobile users (62%+ of traffic) must manually paste URLs. navigator.share() gives native OS share sheets — one tap instead of four. ~10 call sites across lab.js and compare.js.
- **Home page has zero aria-live regions for dynamic content** (DES-260) — P2. Mini-screener tbody and CTA buttons update dynamically after page load but don't announce changes to screen readers. The mini-screener is designed to impress — that moment is silent for assistive tech users.
- **Welcome modal confetti ignores prefers-reduced-motion** (DES-261) — P2. 20 animated particles fire unconditionally after checkout. The `prefersReducedMotion` variable exists at app.js:25 and is used by `_showToast` — but the confetti code doesn't check it. WCAG 2.3.3 violation at the highest-stakes UX moment.
- **Home page CTAs hardcode yearly interval** (DES-262) — P2. Pro/Elite buttons pass `pro_year`/`elite_year` directly. Users who prefer monthly billing can only get it from pricing.html. The home page (the #1 landing page) forces yearly-only checkout. Add a note: "or $9.99/mo — see pricing".
- **Only lab.html has a unique OG image — 74 pages share one generic image** (DES-263) — P2. When someone shares /rankings.html, /tradefinder.html, or /pricing.html on Twitter/Reddit, they all show identical previews. No visual differentiation. Create OG images for the 5 highest-traffic pages.
- **About page Contact section has no direct contact method** (DES-264) — P1. Contact section lists Reddit communities and the domain but no email, no Twitter handle, no DM channel. Users with billing issues or locked accounts have no support path. Stripe compliance risk.
- **Pricing FAQ is always-expanded — 9 items create excessive mobile scroll** (DES-265) — P2. ~1200px of FAQ content on mobile with no collapse/expand. Replace with `<details>/<summary>` for native accordion behavior, accessibility, and compact layout.
- **Home page has no fast path for returning visitors to reach pricing** (DES-266) — P2. 6 sections (~4-5 viewport scrolls) before pricing on mobile. No `id="pricing"` anchor on the section. No skip link. Returning visitors who already know the pitch must re-scroll everything.

### Things confirmed GOOD in cycle 25:
- Toast system (`_showToast`) has `role="alert"` and `aria-live="assertive"` — accessible
- All `target="_blank"` links use `rel="noopener"` — verified
- `handleCheckout()` on pricing.html correctly builds interval from toggle state — good
- `_checkoutInProgress` flag prevents double-click checkout — good
- Console logs are intentional Easter eggs (razzle.help(), tiger art) or error-only catch blocks — appropriate
- `escapeHtml()` used consistently across user-facing content injection — no XSS gaps
- `setInterval` usage is properly cleaned up in warroom.js (`clearInterval` on disconnect/reconnect)
- All 75 pages load Google Fonts with `display=swap` — FOUT handled
- Pricing page interval toggle has `role="switch"`, `aria-checked`, and keyboard handler — accessible
- Pricing page CTA buttons update correctly for trial/paid/expired states via `checkSubscription()`

### Key Insight: Distribution Infrastructure Is the Biggest Gap for Phase 1
Cycle 25 reveals that the TECHNICAL PLUMBING for distribution — the thing that makes every share, tweet, and link maximally effective — has systemic gaps:
- No Twitter account attribution on any shared link (DES-257)
- No native mobile sharing (DES-259)
- Identical OG images across 74 pages (DES-263)
- No contact method for users who need help (DES-264)
- No fast path to pricing for returning visitors (DES-266)

These aren't CSS issues or visual bugs. They're the infrastructure that converts a shared link into a follower, a visitor into a user, and a user into a paying customer. Every gap here is friction in the growth flywheel.

### Cycle 26 Findings: Conversion Copy Precision, Agent Territory, Pricing UX

- **Pricing save-badge reads "save 33%" — Elite actually saves 37%** (DES-267) — P1. The toggle-level badge is the first visual signal of yearly savings value. It never updates from its HTML default. The `updatePricingUI()` function correctly updates each plan card's interval text using `PRICES.pro.save` and `PRICES.elite.save`, but the toggle badge text is static. Also, when monthly is selected, badge hidden via `opacity:0` — screen readers still announce it.

- **Home page Elite card omits "7-day free trial"** (DES-268) — P1. Pro card has "7-day free trial" as highlighted li. Elite card has no mention. Pricing page BOTH cards have trial. Home page inconsistency may signal that trial is Pro-only, pushing Elite-curious users to Pro (lower revenue).

- **Lab sidebar CATEGORY_AGENTS mapping disagrees with HTML icons** (DES-269) — P2. "Trends & Projections" shows dolphin.svg in HTML but JS maps to 'atlas'. 3 categories (College, Teams, Player Tools) have HTML icons but missing from JS mapping entirely. Paid users see mixed agent identity.

- **Footer "made for Reddit" is plain text, not a link** (DES-270) — P2. 73 pages say "made for Reddit" but it's not clickable. About page Contact section has the actual r/DynastyFF link. DES-242 covers missing Twitter link; this is the parallel for Reddit — the community the product is "made for."

- **Pricing card plan names are div not h3** (DES-271) — P2. "Free", "Pro", "Elite" labels on both home and pricing pages use `<div>` instead of `<h3>`. Screen readers can't navigate between plans by heading. Same pattern as DES-233 (FAQ) but on pricing CARDS.

- **Checkout buttons have no visible loading state** (DES-272) — P2. `startCheckout()` sets `_checkoutInProgress = true` but never updates button text or state. 1-3 second gap between click and Stripe redirect feels broken. Auth modal's `handleLogin()` correctly does `btn.disabled = true; btn.textContent = 'signing in...'` — same pattern needed.

- **Home page Pro card says "Bureau deep-dive" but Bureau name never introduced** (DES-273) — P2. Section 4 pitches league connection without naming "the Bureau." First-time visitors reach pricing and see unexplained jargon.

- **Demo briefing card player names may be stale for 2026** (DES-274) — P2. Keenan Allen (34, may retire), Diontae Johnson (off-field issues), "2026 2nd" (date-specific). Demo content is the Situation Room's #1 selling point. Dynasty audience tracks every transaction.

- **Pricing plan cards have no landmark or group role** (DES-275) — P2. Plans-grid div has no `role="group"` or `aria-label`. Individual cards have no `aria-label`. Screen reader users can't efficiently compare plans.

- **Free-celebration section has 8 inline style attributes** (DES-276) — P2. Container alone has 8 CSS properties inline. Forces `!important` in dark mode override. Same pattern as DES-196 (trial banners).

### Things confirmed GOOD in cycle 26:
- All localStorage operations wrapped in try/catch — no unprotected access
- XSS properly escaped via `escapeHtml()` on all user-facing innerHTML
- No hardcoded API URLs — all use `API_BASE` variable or relative paths
- `setInterval`/`setTimeout` properly cleaned up (warroom.js visibility handler + beforeunload)
- Watermark function (`drawRazzleWatermark`) is dark-mode aware with correct isDark check
- Year calculations use dynamic `getFullYear()` across 24+ standalone pages (except DES-239 cap)
- `PRICES` object correctly defines both savings percentages (Pro 33%, Elite 37%)
- `handleCheckout()` stores pending checkout intent in sessionStorage for post-auth resume
- All `target="_blank"` links use `rel="noopener"` — still clean
- Footer structure identical across all 73 pages with `site-footer-grid` — consistent
- `_checkoutInProgress` flag prevents double-click checkout — logic is sound
- Pricing toggle has proper ARIA: `role="switch"`, `aria-checked`, `aria-label`, keyboard handler

### Key Insight: Conversion Copy Precision Matters More Than Visual Polish at This Stage
Cycle 26 reveals that the site's VISUAL quality is high — the design system is well-followed, dark mode works, accessibility gaps are being systematically closed. The remaining issues are increasingly about COPY PRECISION:
- Save percentages that understate value (DES-267)
- Missing trial mention on the highest-value plan (DES-268)
- Unexplained product terminology (DES-273)
- Stale demo content (DES-274)
These are single-word or single-line fixes that have outsized impact on whether a visitor converts. A user who reads "save 33%" when they could save 37% on Elite makes a worse decision. A user who doesn't see "free trial" on Elite might not try the premium tier.

### Audit Dimension Evolution (updated)
- Cycles 1-7: CSS consistency (borders, radius, shadows, colors, dark mode)
- Cycle 8: Accessibility (ARIA, focus), SEO (h1, canonical), dark mode exports
- Cycles 9-11: Deep accessibility (combobox, aria-live, canvas ARIA, tables)
- Cycles 12-14: Conversion path, agent connective tissue, mobile UX
- Cycles 15-16: Performance (memory leaks, lazy loading), semantics, brand
- Cycles 17-18: Mobile touch targets, dark mode native controls, CSS governance
- Cycles 19-20: Type scale violations, hover interactions, platform adaptation
- Cycle 21: Conversion COPY — not just visual, but the words that sell
- Cycle 22: Auth flow + onboarding friction — the funnel BETWEEN pages
- Cycle 23: Content architecture, copy accuracy & handwritten type scale
- Cycle 24: Performance UX, mobile platform, conversion infrastructure
- Cycle 25: Distribution infrastructure — Twitter cards, sharing, OG images
- **Cycle 26: Conversion copy precision, agent territory, pricing UX**
- **Cycle 27: Cross-page dark mode gaps, agents page conversion path, runtime safety**

### Cycle 27 Findings: Cross-Page Dark Mode Gaps, Agents Page Conversion, Runtime Safety

- **league-intel.html has ZERO dark mode page CSS** (DES-277) — P1. The Bureau conversion page (7400 lines) has no `[data-theme="dark"]` rules. JS-generated manager profiles, activity feeds, and trade network visualizations use inline styles that can't be targeted by dark mode. DES-187 covers about.html — this is the higher-priority instance because league-intel IS the conversion engine.

- **agents.html has ZERO dark mode page CSS for wrapper UI** (DES-278) — P1. The Situation Room wrapper (pricing cards, feature table, promo code) has zero dark mode overrides. The pixel canvas is correctly always-dark per DESIGN.md, but the surrounding conversion UI isn't.

- **agents.html feature table header flips incorrectly in dark mode** (DES-279) — P2. `background:var(--ink); color:var(--bg)` creates a dark professional header in light mode but a light header in dark mode. Visual intent breaks.

- **agents.html pricing cards use ~40+ inline style properties** (DES-280) — P2. Zero CSS classes. Can't be targeted by `@media` for mobile or `[data-theme="dark"]` for dark mode. Same pattern as DES-276 (pricing) and DES-196 (trial sections) on a different page.

- **agents.html CTA buttons hardcode yearly interval** (DES-281) — P1. Shows "$9.99/month" text but CTA passes `pro_year` to startCheckout. Same pattern as DES-262 (home page), now confirmed on a second conversion surface. Monthly-preference users can only get monthly billing from pricing.html.

- **window.open() without noopener on scatter chart clicks** (DES-282) — P2. 2 instances in explorer.html and lab-panels.js. All `target="_blank"` HTML links correctly use `rel="noopener"`, but JS `window.open()` was missed.

- **draftclass.html missing encodeURIComponent** (DES-283) — P2. Only page that links to `/player/` without URL-encoding the player ID.

- **startCheckout finally block flashes button during redirect** (DES-284) — P2. JS `finally` runs even after `return`. Button briefly shows original text during Stripe redirect on slow networks.

- **404.html zero dark mode page CSS** (DES-285) — P2. Low-traffic but the only error page. Dark mode users who hit a 404 see inverted text-shadow.

- **agents.html "recommended" badge uses color:var(--bg)** (DES-286) — P2. Becomes dark text on orange in dark mode. Should use `var(--text-on-accent)` which pricing.html badges already use correctly.

### Things confirmed GOOD in cycle 27:
- lab.js has AbortSignal.timeout(15000) on screener fetch — DES-150 addressed with graceful fallback for older browsers
- Mini-screener table rows have proper `:hover` state (`.mini-table tbody tr:hover { background: var(--bg-warm); }`)
- Auth modal has correct ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus management, Escape dismiss
- Pricing page interval toggle has `role="switch"`, `aria-checked`, keyboard handler — fully accessible
- `startCheckout` stores pending checkout in sessionStorage for post-auth resume — checkout intent survives auth flow
- `validatePromoCode` IS in app.js — agents.html can call it (it uses `typeof` guard correctly)
- All OG meta tags (title, description, image, url, site_name) present on all 6 main pages
- Mini-screener position filter tabs are proper `<button>` elements (not spans or divs)
- Home page mini-screener uses CSS vars for position colors (`var(--pos-qb)` etc.) — good design system compliance

### Key Insight: The Agents Page Is an Unreached Conversion Surface

Cycles 21-26 focused heavily on home page and pricing page conversion paths. Cycle 27 reveals that agents.html — the Situation Room — is a THIRD conversion surface that has been almost entirely ignored from a polish perspective:
- Zero dark mode CSS (DES-278)
- Massive inline styles (DES-280)
- Hardcoded yearly interval (DES-281)
- Broken badge contrast (DES-286)
- Incorrectly-flipping table header (DES-279)

The Situation Room is where users experience the AI agents in action — the premium product. If they're impressed and click "Get Elite," the conversion UI should be as polished as pricing.html. Right now it's the weakest of the three conversion surfaces.

### Key Insight: Dark Mode CSS Is a Systemic Gap Across Non-Main Pages

DES-187 (about.html) was the first dark mode zero-CSS finding. Cycle 27 adds league-intel.html (DES-277), agents.html (DES-278), and 404.html (DES-285). The pattern: pages built in later phases didn't receive dark mode overrides because CSS var auto-flipping handles ~80% of cases. The remaining 20% (JS-generated inline styles, intentionally-inverted elements, special backgrounds) needs page-level dark mode rules.

### Cycle 19 Findings: Type Scale Violations, Accessibility Blockers, Mobile Defense
- **font-size:9px appears 141 times across 26 files** (DES-197) — below the DESIGN.md type scale minimum of 11px. Used on position badges, stat labels, and separators throughout the Lab, Trade Analyzer, and panel pages. These are screenshot-visible elements — 9px text is nearly illegible in shared images.
- **font-weight:bold used 23 times instead of numeric 700** (DES-198) — minor design system governance issue. `bold` = 700 functionally, but breaks grep-based auditing and deviates from the numeric convention used everywhere else.
- **7 pixel-based line-heights** (DES-199) — lab-panels.css, lab.html, styles.css, tradevalues.html. Pixel line-heights don't scale with user font-size preferences. Small scope, easy fix.
- **Trade Finder headshot images cause CLS** (DES-200) — 4 `<img>` tags in tradefinder.html lack width/height attributes. Dynamic player results shift layout on mobile as images load. Trade Finder is a conversion tool in Bones' territory.
- **Pro teaser blur bypassed by keyboard** (DES-201) — P1. `pointer-events:none` blocks mouse but NOT keyboard. Tab key focuses elements behind blurred Pro content in formula-store.js, league-intel.html, and agents.html. This is a conversion gate bypass. Fix: `inert` attribute.
- **Formula builder row remove is <span onclick>** (DES-202) — no keyboard access, no ARIA, no role="button". The formula builder is a flagship feature marketed on pricing page. Screen reader and keyboard users can't remove formula rows.
- **white-space:nowrap causes mobile overflow in panels** (DES-203) — 60+ instances in lab-panels.css. Panel table headers and player names set to nowrap push containers wider than mobile viewport, especially inside Lab sidebar iframe.
- **6 scattered @media breakpoints** (DES-204) — 768px and 480px are well-governed, but 375px (6), 640px (2), 900px (1), and 600px (1) are one-offs. Creates 6 widths to test instead of 3.
- **Formula builder controls missing aria-label** (DES-205) — 3 controls (stat select, operator select, weight input) all unlabeled. WCAG 1.3.1 and 4.1.2 violation.
- **No format-detection meta on 75 pages** (DES-206) — mobile Safari auto-links number patterns as phone numbers. Fantasy stat tables full of number patterns (238-1024-7) get blue telephone links.

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
1. **P0 — Auth infrastructure** — DES-227 (no forgot password flow)
2. **P1 — Conversion path integrity** — DES-127 (pricing dark mode), DES-128 (feature matrix mismatch), DES-208 (demo card contrast), DES-228 (no trial incentive at registration), DES-229 (Sleeper "permanently" anxiety), DES-230 (60+ vs 70+ post-checkout), DES-231 (no privacy/terms link)
3. **P1 — Visible dark mode bugs** — DES-079 (textColorForBg), DES-080 (Trade Analyzer PNG), DES-127 (pricing page ZERO dark mode rules), DES-208 (demo card text invisible in light mode)
4. **P1 — SEO fundamentals** — DES-077 (h1 on lab.html), DES-078 (canonical/og:url on 67 pages)
5. **P2 — Deep linking + shareability** — DES-232 (feature comparison anchor), DES-234 (pricing section ids)
6. **P2 — Keyboard accessibility** — DES-081 (theme toggle focus), DES-084 (interactive spans role=button), DES-130 (hero CTAs no focus-visible), DES-210 (nav dropdown zero ARIA)
7. **P2 — Heading hierarchy / SEO** — DES-233 (FAQ questions div not h3), DES-235 (about page missing Twitter)
8. **P2 — Home page polish** — DES-207 (cards no hover-lift), DES-213 (overflow-x:hidden anti-pattern)
9. **P3 — Design system governance** — DES-211 (10px font-size), DES-236 (nav dropdown 10px), DES-209 (hero shadow), DES-212 (emoji icons), DES-215 (Ctrl+K), DES-216 (inline grids)

### Cycle 13 Findings: Mobile UX, Dark Mode Polish, Resilience
- **Zero :active states on .btn-primary and .btn-chunky** (DES-137) — the two most-used button classes in the entire codebase. Every CTA (Get Pro, Add Filter, Export, Apply) gives zero visual feedback when tapped on mobile. `.btn-hero` was fixed by DES-135 but the global classes were missed.
- **.input-chunky (13px) and .select-chunky (12px) trigger iOS auto-zoom** (DES-138) — the Screener's core filter inputs are below the 16px iOS threshold. Every filter interaction on iPhone zooms the page. Auth inputs (16px) and cmd-palette (18px) are already correct — pattern exists, just not applied to screener controls.
- **Zero <meta name="theme-color"> in 75 pages** (DES-139) — mobile browser address bar stays default gray/white instead of warm sand. Every competing tool has this. First visual signal of polish on mobile.
- **Dark mode overlays use cold black rgba(0,0,0)** (DES-140) — 3 instances in styles.css. DESIGN.md explicitly bans cold grays/blacks. Light mode overlay correctly uses warm espresso rgba(45,31,20). Dark mode should use rgba(26,17,10) (bg-ink at opacity).
- **Column picker height:100vh clips on mobile** (DES-141) — 100vh includes area behind mobile browser chrome. Bottom columns unreachable. Should use 100dvh.
- **5 instances of rotate(2deg) instead of DESIGN.md's 3deg** (DES-142) — pricing, lab, league-intel. 10+ instances correctly use 3deg. Subtle brand inconsistency.
- **.footer-link has no :focus-visible** (DES-143) — same gap as DES-082 (nav links, fixed) but for footer. Footer is the fallback navigation.
- **Zero twitter:image:alt in the codebase** (DES-144) — Twitter is the primary launch channel (Phase 1). Every card missing descriptive alt text.
- **Zero <noscript> tags** (DES-145) — JS failure = blank page. Ad blockers, slow connections, corporate firewalls. Branded fallback message prevents bounce.
- **Dark mode ignores OS preference** (DES-146) — no prefers-color-scheme detection. Power users (primary target) who prefer dark mode see light on first visit.

### Cycle 14 Findings: Conversion Path, Performance UX, Accessibility Gaps
- **Upgrade gate says "60+ panels" — marketing says "70+"** (DES-156) — the conversion modal that convinces free users to check pricing has mismatched copy. NORTH_STAR.md, pricing.html, and DESIGN.md all say 70+. This is a trust issue for Reddit users who verify claims.
- **Screener table has CLS — empty thead reflows on data load** (DES-149) — the growth engine's flagship table has `<thead></thead>` (empty) and a 5-column skeleton that doesn't match the 10-20 column actual table. When data arrives, visible layout shift occurs. Affects Core Web Vitals and first impression.
- **No fetch timeout on screener API calls** (DES-150) — the main data fetch has AbortController for dedup but zero timeout. On slow mobile networks (62% of traffic), "pulling film..." spinner shows indefinitely with no error feedback. Browser default timeout is 5-15 minutes.
- **Sidebar lock icons invisible to screen readers** (DES-147) — 30+ Pro-locked panels use CSS `::after` pseudo-element for the lock emoji. No `aria-label`, no screen reader text. Keyboard users can't distinguish free from locked panels.
- **Upgrade gate modal has no role="dialog"** (DES-154) — the modal shown to every free user clicking a locked panel has zero accessibility attributes. No `role="dialog"`, no `aria-modal`, no focus trap, no Escape dismiss. Compare with auth modal which correctly has all of these.
- **Mobile nav has no focus trap** (DES-155) — the overlay panel (z-index 9999) doesn't use `inert` or focus management. Tab key escapes to hidden content behind the overlay. All other aspects of mobile nav are excellent (ARIA, close mechanisms, touch targets).
- **Page size dropdown is a dead control** (DES-151) — single `<option value="25">25</option>` in a select. Power users browsing 1000+ players must paginate through 40 pages. The `changePageSize()` handler works — just needs 50/100 options added.
- **league-intel.html (7400 lines) has no scroll-to-top** (DES-152) — the Bureau conversion page is the longest in the codebase with zero scroll navigation helpers. Lab has a well-designed scroll-top button that could be reused.
- **aging.html legend dot uses hardcoded rgba** (DES-153) — `rgba(138,117,101,0.5)` bypasses CSS variables. Poor contrast in dark mode against espresso background.
- **pricing.html Twitter link missing rel="noopener"** (DES-148) — only external link in the codebase without this attribute. All others correct.

### Cycle 15 Findings: Performance UX, Design System Governance, Conversion Messaging
- **lab-panels.js has 197 addEventListener with 0 removeEventListener** (DES-157) — the growth engine page accumulates event listeners without cleanup. Extended browsing sessions (exactly how dynasty power users explore) cause progressive slowdown. This is the most impactful performance bug found so far — it affects the page that creates first impressions.
- **Z-index values are ungoverned — 42 instances across 8 files** (DES-158) — values range from 1 to 99999 with no hierarchy. Six separate elements use z-index:9999. One confetti animation uses 10001, one particle effect uses 99999. When multiple overlays are active (upgrade gate + tooltip + dropdown), stacking order is unpredictable. The upgrade gate is the #1 conversion touchpoint — if it renders behind a tooltip, that's a lost conversion.
- **Home page free tier pricing card omits "70+ analytical panels"** (DES-159) — pricing.html correctly lists this feature for free tier, but the home page's free tier card doesn't mention panels at all. Since panels are the primary gateway to Pro conversion (seeing locked panels triggers upgrades), hiding their existence on the home page breaks the top of the funnel.
- **Home page uses <div> instead of <section> for 6+ content blocks** (DES-160) — features, discovery, social proof, Bureau, Situation Room, pricing sections all use generic divs. Screen readers and search crawlers can't identify page landmarks.
- **5+ buttons in lab.html missing type="button"** (DES-161) — per HTML spec, buttons without type default to type="submit". Currently safe (outside forms) but fragile.
- **50% of images (19/38) missing loading="lazy"** (DES-162) — 8 agent sidebar icons in lab.html load eagerly on every page load despite being below the fold.
- **Elite CTA on home page uses inline style instead of .btn-elite class** (DES-163) — pricing.html uses the correct CSS class; home page bypasses it with inline background/font-size/width.
- **league-intel.html email input missing autocomplete="email"** (DES-164) — the Bureau connection form (conversion engine entry point) doesn't trigger mobile email keyboard or autofill.
- **40+ JS inline font-size values bypass the design system type scale** (DES-165) — app.js, agent-nudges.js, lab-panels.js hardcode pixel sizes instead of using CSS classes.
- **warroom.js has 30 addEventListener with 0 removeEventListener** (DES-166) — the Situation Room (premium product) leaks event listeners during AI conversation sessions.

### Things confirmed GOOD in cycle 15:
- **Zero console.log debug statements** — all 5 instances are intentional developer tools (razzle.help(), razzle.tiger(), razzle.stats()). No debug logging leaking to production. Good discipline.
- **All target="_blank" links have rel="noopener"** — 4/4 correctly hardened. DES-148 (pricing Twitter link) fix was verified.
- **No user-scalable=no or maximum-scale=1** — pinch-to-zoom is accessible on all 75 pages.
- **CSS !important usage is justified** — 36 instances, all for utilities (.hide-mobile), accessibility (prefers-reduced-motion), or error states. No arbitrary !important overriding.
- **setTimeout/setInterval values are reasonable** — 14 unique delays, all standard UX timing (300ms animations, 2.5s toasts, 8s educational content).
- **Image formats are appropriate** — SVGs for agent icons, PNGs for pixel art sprites. No unnecessary format bloat.

### Cycle 16 Findings: Web Standards, Privacy, Brand Identity, SEO
- **app.js (1965 lines) blocks first paint on all 71 pages** (DES-167) — the shared core script has no `defer` attribute. Lab.html correctly defers lab.js/formulas.js/charts.js/lab-panels.js, but app.js (loaded on every page) is never deferred. This is the highest-leverage performance fix: one attribute, 71 pages faster.
- **29+ player headshot images use alt="" (decorative)** (DES-168) — across 25+ panel pages, player identity images are marked as decorative. Screen readers skip them entirely. Pattern: `<img alt="" ...>` in JS-generated innerHTML. Player name should be in alt text.
- **signOut() leaks 5 user-generated localStorage keys** (DES-169) — saved_views, custom_scoring, my_roster, pinned_cache, col_widths all persist after logout. On shared computers, next user sees previous user's data. signOut() clears 18 keys but misses these 5.
- **31+ footer links cause redirect roundtrip** (DES-170) — home page footer links to standalone HTML pages that immediately redirect to `/lab.html?panel=X`. Users clicking footer links get an unnecessary page load. Should link directly to Lab panel URLs.
- **75 pages use `<a href="#">` for Sign In, only index.html uses `<button>`** (DES-171) — systemic semantic gap. Screen readers announce "link" instead of "button". If JS fails, clicking jumps to page top.
- **No web app manifest or apple-touch-icon** (DES-172) — zero manifest.json, zero apple-touch-icon. Site can't be installed as PWA. iOS home screen shows screenshot instead of tiger.
- **10+ fetch calls silently swallow errors** (DES-173) — `.catch(function(){})` on formula sync, watchlist sync, analytics, saved views. User's action appears to succeed but nothing happened.
- **Hero mascot uses platform-dependent emoji instead of designed SVG** (DES-174) — the first visual impression uses 🐯 which renders differently on Apple/Google/Samsung/Windows. The designed `razzle.svg` exists but isn't used in the hero.
- **Pricing FAQ has no FAQPage JSON-LD** (DES-175) — 9 Q&A pairs with no structured data. Missing free SERP real estate on the conversion page.
- **Pricing FAQ uses 100% inline styles** (DES-176) — 36 inline style strings, zero CSS classes. Can't media-query resize for mobile. 12px mono text on 375px screens is at the edge of readability.

### Things confirmed GOOD in cycle 16:
- **Zero eval() in the entire frontend** — no dynamic code execution. Clean.
- **Zero document.write()** — no DOM mutation anti-patterns. Clean.
- **Auth modal inputs have proper autocomplete attributes** — email, current-password, new-password all correct.
- **All 75 pages have meta description** — SEO fundamentals complete.
- **All scroll/touch listeners use { passive: true }** — no scroll jank from non-passive listeners.
- **Clipboard API usage is correct** — navigator.clipboard.writeText with feature detection and try/catch fallback throughout.

### Cycle 17 Findings: Performance UX, Mobile Touch Targets, Dark Mode Native, Accessibility Polish
- **Google Fonts CSS render-blocks first paint on ALL 75 pages** (DES-177) — `<link rel="stylesheet" href="fonts.googleapis.com...">` prevents any paint until the external CSS downloads. `display=swap` prevents invisible text (FOIT) but the CSS file itself blocks rendering. On slow mobile connections (62% of Twitter/Reddit traffic), this means 200-800ms of blank page. Fix: switch to `media="print" onload="this.media='all'"` non-blocking pattern. One pattern change, 75 pages faster.
- **8 selectors use `transition: all` instead of specific properties** (DES-178) — forces browser to track all CSS properties for animation, including layout-triggering ones (width, height, margin). Affects nav links, chips, badges, buttons — elements that appear on every page.
- **78 dead `-webkit-overflow-scrolling: touch` instances across 40 files** (DES-179) — deprecated since iOS 13 (September 2019). Zero effect on any current browser. Heaviest in lab-panels.js (31 instances). Signals stale codebase to source-view inspectors.
- **Touch targets 24px, below 44px WCAG minimum** (DES-180) — `.nav-search-hint`, `.chip`, `.pos-badge`, `.ccp-chip-rm`, `.rbld-remove-btn` all set `min-height: 24px`. These are CORE screener interactions (position filter, remove filter, search hint). `.auth-modal-close` correctly uses `min-height: 44px` — the pattern exists but wasn't propagated.
- **6 number inputs show browser-default spinners** (DES-181) — only `.filter-input-sm` in lab.html hides WebKit spinners. 6 other `type="number"` inputs (roster count, formula weights, filter value, etc.) show Chrome/Firefox/Safari native up/down arrows. Breaks the hand-crafted aesthetic.
- **Zero `scroll-margin-top` / `scroll-padding-top` in entire CSS** (DES-182) — sticky nav (~56px) covers content when navigating to anchor targets. Home page "See what's inside" → `#features` and skip link → `#main-content` both land behind the nav.
- **No `color-scheme` property** (DES-183) — in dark mode, browser-native UI elements (scrollbars, select dropdown menus, checkbox controls, autofill backgrounds) remain light-themed. 2-line CSS fix completes the dark mode experience.
- **Zero `aria-current="page"` on active nav links** (DES-184) — nav uses `.active` class for visual indication but screen readers can't identify the current page. All 75 pages have proper `<nav aria-label>` landmarks — this completes the navigation accessibility story.
- **`prefers-reduced-motion` doesn't disable hover-lift transforms** (DES-185) — transitions become instant (0.01ms) but elements still shift position via `translate(-1px, -1px)`. Instant position jumps can be more disorienting than animated ones for users with vestibular disorders.
- **Home page `#features` anchor has no smooth scroll** (DES-186) — the secondary hero CTA causes an instant jump. Zero `scroll-behavior: smooth` anywhere in the CSS. `prefers-reduced-motion` already overrides to `auto` — just need to set the smooth default.

### Things confirmed GOOD in cycle 17:
- **All pages have `lang="en"`** — no missing language declarations.
- **All pages use `<nav>` with `aria-label="Main navigation"`** — nav landmarks complete.
- **`outline: none` is always paired with `:focus-visible` replacement** — auth inputs, chunky inputs, selects, cmd palette all correct.
- **`.topnav` uses `position: sticky`** (not `fixed`) — proper document flow, no content hidden behind nav by default.
- **API is same-origin** (`window.location.origin`) — no preconnect needed for API calls.
- **`display=swap` prevents FOIT** — fonts swap in correctly, just the CSS load that blocks.
- **Preconnect hints for Google Fonts are in place** — DNS+TCP+TLS starts early.
- **`aria-live` regions are widespread** — 40+ files have proper `role="status" aria-live="polite"` on dynamic content areas.
- **`aria-describedby` is used on all form inputs** — auth, formula publish, Sleeper connect, pricing promo all link to error regions.

### Cycle 18 Findings: Dark Mode Gaps, Mobile Conversion, Accessibility Inputs, Design System Governance
- **about.html has ZERO dark mode CSS overrides** (DES-187) — every other main page has 15-20+ dark mode rules. This is the trust/evaluation page where users read about privacy and data handling. Completely broken in dark mode.
- **pricing.html upgrade grid has inline style defeating CSS breakpoints** (DES-188) — `style="grid-template-columns:1fr 1fr;"` overrides the responsive CSS. At 375px, two pricing cards side by side are ~170px each — too narrow for readable conversion copy.
- **Home mini-screener sortable `<th onclick>` has zero keyboard support** (DES-189) — no tabindex, no role="button", no aria-sort. This is the front-door demo. DES-109 covers the tr-click accessibility; this covers the th-sort accessibility. Different elements, same page.
- **7+ search inputs use placeholder as sole accessible label** (DES-190) — lab.html column picker, trade analyzer give/get, trade value comp A/B, auction.html search, tools.html search. The aria-label pattern exists in 12+ other files (breakdown, career, gamelog, etc.) but wasn't propagated everywhere.
- **Home page conversion CTAs use 120-char inline onclick handlers** (DES-191) — both Get Pro and Get Elite buttons have massive inline JS that checks localStorage, sessionStorage, dispatches to openAuthModal or startCheckout. pricing.html uses clean `onclick="handleCheckout('pro')"` — the correct pattern exists but wasn't used on the home page.
- **Hero mascot drop-shadow is 3px not DESIGN.md's 4px** (DES-192) — also uses hardcoded rgba that doesn't flip in dark mode.
- **Two font-size:15px in styles.css** (DES-193) — .input-chunky::placeholder (line 943) and .nav-search-hint (line 1184). Neither 15px value is on the type scale.
- **Footer across 73 pages uses flat div groups** (DES-195) — no nav landmarks, no list structure, heading divs instead of h3. Search engines and screen readers can't identify footer navigation.
- **pricing.html trial/celebration/upgrade sections use 8+ massive inline-styled divs** (DES-196) — can't be targeted by dark mode CSS or mobile media queries.

### Things confirmed GOOD in cycle 18:
- **Zero cursor:pointer on non-interactive elements** — all 17 instances are on buttons, links, or interactive divs with role attributes.
- **Zero opacity:0 / visibility:hidden traps** — no hidden elements stealing focus or space.
- **Zero tabindex > 0** — natural tab order preserved everywhere. One tabindex="0" on warroom canvas is correct.
- **Z-index hierarchy is clear** — watermark(1) < general(1000) < cmd-palette(9000) < modals(9998-9999). No chaos.
- **All innerHTML user data properly escaped** — escapeHtml() used on all user-generated content in 593 innerHTML operations.
- **setInterval properly cleaned up** — warroom.js has clearInterval in visibility change handler. No leaks.
- **All console.error/warn are legitimate** — 21 instances, all for API failures and render errors, no sensitive data.
- **XSS risk is LOW** — no eval(), no document.write(), all user input escaped, no unvalidated innerHTML.

### Emerging Patterns (updated DES-196)
- **Conversion path copy accuracy is now a P1 concern** — DES-156 (upgrade gate 60+ vs 70+), DES-159 (home page omits 70+ panels), and DES-128 (feature matrix mismatch) all risk Reddit trust damage. Dynasty managers verify claims. Three surfaces now have inconsistent panel messaging.
- **about.html is the forgotten page** — every other main page has dark mode, semantic structure improvements, accessibility fixes. about.html has none of these. It was likely built early and never revisited.
- **Inline styles on conversion pages are a systemic problem** — pricing.html has DES-176 (FAQ), DES-196 (trial/celebration), and DES-188 (grid override). Home page has DES-163 (Elite CTA) and DES-191 (onclick handlers). These inline styles prevent dark mode and mobile CSS from working.
- **The "pattern exists but wasn't propagated" theme is strengthening** — aria-label exists on 12+ inputs but not 7+ others. handleCheckout() exists on pricing but not home. About.html dark mode skipped while 5 other pages got it. The codebase's quality ceiling is high — it just has consistency gaps.
- **The audit has progressed through 9 distinct layers**: (1) Visual consistency (colors, radius, borders, shadows) cycles 1-7, (2) Dark mode completeness cycles 3-8, (3) Accessibility (ARIA, focus, keyboard) cycles 8-11, (4) Conversion funnel integrity cycle 12, (5) Mobile UX + resilience cycle 13, (6) Performance UX + conversion path a11y cycle 14, (7) Design system governance + memory management cycle 15, (8) Web standards, privacy, brand identity, SEO cycle 16, (9) Performance UX deep (render-blocking, transitions), mobile touch targets, dark mode native controls, accessibility polish cycle 17. Each layer reveals the next.
- **Memory leaks are the deepest performance layer yet** — DES-149 (CLS) and DES-150 (fetch timeout) were visible performance issues. DES-157 (197 listeners) and DES-166 (30 listeners) are invisible ones — they degrade over time during extended sessions. Dynasty power users are the exact users who have extended sessions. This is the first time the audit has gone below the visible layer into runtime behavior.
- **Z-index governance is a design system gap, not a bug** — The 42 scattered z-index values aren't individually wrong. They work by accident. But the system has no hierarchy, so any new modal or overlay is a stacking lottery. Defining CSS custom properties for z-index tiers is a platform fix that prevents future bugs.
- **Dialog accessibility is systematically missing on dynamic modals** — the upgrade gate (DES-154) joins the earlier DES-083 finding (5 dynamic modals missing role="dialog"). The pattern: static HTML modals (lab.html auth) are correct, JS-created overlays are not. The mobile nav overlay (DES-155) is the same pattern — excellent visual implementation, missing keyboard/screen reader layer.
- **The "dead control" pattern** — page size dropdown (DES-151) is a control that exists, renders correctly, has a working handler, but offers only one choice. Similar to sidebar cat-icons (DES-131) which exist but are display:none. Multiple built features sitting unused.
- **Scroll UX is asymmetric** — Lab has a well-designed scroll-to-top button; the 7400-line Bureau page has none. The home page and pricing page also lack scroll helpers. The pattern exists in code but wasn't propagated.
- **Things confirmed GOOD in cycle 14 (should be preserved):**
  - Error handling is excellent — 6 randomized football-themed messages, toast with retry buttons, offline detection, panel isolation
  - Mobile nav is production-ready — hamburger, ARIA, 3 close mechanisms, 44px targets (only focus trap missing)
  - Pricing page conversion flow is solid — auth->checkout intent, annual/monthly toggle, trial messaging, contextual CTAs
  - Standalone dark mode: 5/6 pages audited are fully compliant (only aging.html has 1 hardcoded rgba)
  - Link consistency: zero broken links, all nav targets correct, footers identical across 5 pages
  - 404 page is delightful and on-brand with tiger animation easter egg
- **Agent connective tissue is 60% built, 40% invisible** — sidebar icons CSS-hidden, lab-panels.js never calls agent-voiced functions, Bureau has zero agent presence. (Unchanged from cycle 12.)
- **Canvas hardcoded hex remains** — ~30 instances. DES-069 (getCanvasTheme accent colors) is still the keystone fix.
- **Feature matrix contradicts product spec** — "70+ analytical panels" marked ✓ for free tier, but NORTH_STAR says panels are behind lock icons for free users. This is a trust landmine for Reddit.
- **Web fundamentals gap: the "last 10%"** — The visual design and feature set are impressive. But web standards fundamentals (defer scripts, semantic buttons, PWA manifest, alt text, structured data) are the "last 10%" that separates a project from a production product. These are invisible to most users but visible to Google, screen readers, and savvy Reddit users who inspect source.
- **Privacy on shared computers** — signOut() clearing 18 keys but missing 5 user-generated stores is the kind of bug that produces "I logged out but my roommate saw my roster" posts. Low frequency, high damage when it happens.
- **Render-blocking fonts are the #1 remaining performance lever** — DES-167 (app.js defer) was the most impactful script performance fix. DES-177 (non-blocking Google Fonts) is the CSS equivalent. Together they eliminate the two biggest first-paint blockers. After these two, the main render path is: HTML → styles.css → paint. That's optimal.
- **Touch target compliance follows a predictable pattern** — desktop-first elements (24px badges, 24px chips) work fine with a mouse cursor. On mobile, they're miss-tap magnets. The fix pattern is consistent: add mobile media query `min-height: 44px`. The auth modal close button is the reference implementation.
- **Dark mode is 95% complete, 5% native** — All custom-styled elements correctly use CSS variables. The remaining 5% is browser-native controls (scrollbars, select menus, autofill) that need `color-scheme: dark` to adapt. This is a 2-line platform fix.
- **Dead CSS accumulation** — 78 instances of `-webkit-overflow-scrolling: touch` represent 7 years of dead code. Not harmful, but a signal. In a codebase viewed by the target audience (tech-comfortable dynasty managers), dead code patterns reduce trust.
- **The `<a href="#">` pattern is a codebase-wide infection** — index.html was built correctly (button). All 75 other pages were built from a different template that used the `<a href="#">` pattern. This is a template divergence problem, not a one-off mistake.
- **Conversion funnel has fragile JS dependencies** — Sign In button, pricing CTAs, and mini-screener all use inline onclick handlers that fail silently if app.js doesn't load. Ad blockers, CDN failures, or slow networks = dead buttons.
- **Things that are GOOD and should be preserved:**
  - Zero rogue font families (confirmed cycle 8)
  - Zero generic "Loading..." text (confirmed cycle 8)
  - Zero gradients in CSS classes (2 inline cases were fixed)
  - Agent watermark rotation works (6 SVG icons on screenshot exports)
  - Agent easter egg peek works (1-in-7 chance page-specific agent)
  - Agent panel header attribution works (icon + name, Caveat font)
  - Agent one-liners work for Pro users (contextual quips from getOneLiner)
  - Elite nudge system is complete (11 nudges, session cap, dismiss persistence)

### Cycle 12 Findings: Conversion Path + Agent Connective Tissue
- **Pricing page dark mode is the single highest-priority fix** — the #1 conversion page has NO dark mode rules. Zero. Compare this to index.html and lab.html which both have dark mode.
- **Feature matrix accuracy is a Reddit trust issue** — dynasty managers on r/DynastyFF verify everything. If the pricing page says free=70+ panels but the product locks them, that's one angry post from "bait-and-switch this tool."
- **Agent sidebar icons are built but hidden** — the HTML elements exist, the SVGs exist, the territory config exists. Someone set display:none on 12 cat-icon spans and it was never reversed. This is a 1-line CSS fix to unhide + a mapping update to use agent SVGs instead of emoji.
- **lab-panels.js is the biggest agent personality gap** — 4000+ lines of panel rendering code that never calls getLoadingText/getEmptyText/getErrorText. The main screener uses agent voice; the panels don't. This is where Layer 1 (free personality) breaks down.
- **Trial messaging is the lowest-hanging conversion fruit** — "7-day free trial, no credit card" is buried in a feature list bullet and FAQ. Moving it to the pricing hero or above CTAs is a copy change with high conversion impact.
- **Audit scope is shifting from CSS compliance to product integrity** — cycles 1-7 focused on colors, radius, borders, shadows. Cycles 8-11 expanded to accessibility and SEO. Cycle 12 reaches the conversion funnel itself: does the pricing page accurately represent the product? Do the CTAs work under adverse conditions? Is the trust-building stack complete?
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

### Cycle 11 Findings: Table Semantics, Sidebar Keyboard Nav, Structural Accessibility

Five new audit dimensions this cycle — moving from ARIA attributes to deeper structural accessibility:

- **Lab sidebar is 100% mouse-only** (DES-107, DES-108) — the product's primary navigation to 70+ panels has ZERO keyboard support. 60+ `<a>` elements have no `href` or `tabindex` (not focusable). 8 category divs have no `role="button"`, no `aria-expanded`, no keyboard handler. This is the single largest accessibility gap remaining — it affects every paid feature.
- **82+ data tables have no `<caption>`** (DES-110) — lab.html screener is the ONLY table with a screen-reader-visible caption. 45 standalone page tables + 37 lab-panels.js tables are nameless. Screen readers list tables by caption; without one, all 82+ tables are indistinguishable.
- **Zero `scope="col"` outside lab.js** (DES-111) — lab.js correctly uses `scope="col"` on all 8 header types. But lab-panels.js (37 tables) and all standalone pages (45+ tables) have zero scope attributes. The pattern exists; it just wasn't extended.
- **Agent SVGs have no `<title>` and are always `alt=""`** (DES-112) — the identity layer described in the agent connective tissue design is invisible to screen readers. 6 SVG files, no titles. All `<img>` references use empty alt.
- **Zero scroll indicators on 58+ overflow tables** (DES-114) — mobile users from Twitter/Reddit get no visual cue that data extends offscreen. No shadow, no fade, no arrow.
- **Home page mini-screener rows use `onclick` only** (DES-109) — `<tr onclick="window.location=...">` with no tabindex, role, or keyboard handler. Conversion funnel entry point is mouse-only.
- **11 empty `<th></th>` have no accessible name** (DES-113) — screen readers say "column header, empty" for spacer/action columns.
- **50 inline `onerror` handlers duplicated across 25 files** (DES-115) — CSP risk if security headers are added later.
- **67 pages skip-link targets `<span>` not `<main>`** (DES-116) — functional but suboptimal; the `<main>` landmark exists but isn't the skip-link target.

### Cycle 10 fix verification
- **DES-097 CONFIRMED FIXED** — `aria-describedby` now links auth modal inputs to error messages. `aria-invalid` is set/removed dynamically. Formula publish and Sleeper connect also fixed.
- **DES-093 partially fixed** — `aria-live` now present in 40 files (41 instances). Verify completeness per ticket.
- **DES-092 partially fixed** — `role="alert"` now in 4 files (5 instances). Verify coverage.
- **Position colors are NOT color-only** — all position badges include text labels (QB/RB/WR/TE). No color-blind ticket needed.
- **All `<select>` elements have `aria-label`** — no unlabeled dropdowns.
- **All 75 pages have `<nav aria-label="Main navigation">`** — nav landmarks complete.
- **All 75 pages use `display=swap` for fonts** — no FOIT issues.

### Issue Categories by Impact (updated DES-116)
1. **P1 — Lab sidebar keyboard navigation** — DES-107 (panel links not focusable), DES-108 (categories not accessible). THE biggest remaining gap.
2. **P1 — Home page keyboard accessibility** — DES-109 (mini-screener rows mouse-only). Conversion funnel.
3. **P1 — Prior cycle keyboard/ARIA** — DES-081, DES-084, DES-087, DES-088, DES-089, DES-090, DES-092, DES-094 (still open)
4. **P2 — Table semantics** — DES-110 (82+ tables no caption), DES-111 (zero scope=col), DES-113 (empty th)
5. **P2 — Agent identity** — DES-112 (SVG icons invisible to screen readers)
6. **P2 — Mobile usability** — DES-114 (no scroll indicators on overflow tables)
7. **P2 — Code quality / CSP** — DES-115 (50 inline onerror handlers)
8. **P3 — Landmarks** — DES-116 (skip-link targets span not main)

### Emerging Patterns (updated DES-116)
- **The visual layer is done. The structural layer is not.** Cycles 1-8 fixed every visual issue: colors, fonts, borders, radius, dark mode, shadows. Cycles 9-10 fixed the ARIA layer: roles, live regions, focus-visible, contrast. Cycle 11 reveals the next layer down: table semantics (caption, scope), sidebar keyboard navigation, and scroll UX. Each cycle peels back one more layer of the accessibility onion.
- **Lab sidebar keyboard nav is the new #1 gap.** It's the equivalent of finding that the Lab screener's `<th>` elements had no `scope` — the foundational navigation structure is correctly built visually but has zero structural accessibility.
- **Table semantics follow the same "exists once, not extended" pattern** as previous issues. `<caption>` exists on the screener table. `scope="col"` exists in lab.js. Neither pattern was applied to the 82+ other tables. This is the same root cause as canvas ARIA (static canvases have it, JS-created ones don't) and many other issues.
- **The position color-blind concern was a false alarm** — every position badge includes text. Good design discipline.
- **Things that are GOOD and should be preserved:**
  - Zero rogue font families (confirmed cycle 11)
  - Zero generic "Loading..." text (confirmed cycle 11)
  - Zero gradients in CSS classes
  - Zero cold grays, zero blue-black ink
  - Zero color:white/color:#fff in lab.js or HTML pages
  - Zero 1px borders in lab.js
  - All 75 pages have lang="en"
  - All 75 pages have skip-to-content links (functional)
  - All 75 pages have `<nav aria-label="Main navigation">`
  - All 75 pages have `<footer>` element
  - All 75 pages use display=swap for fonts
  - All `<select>` elements have aria-label
  - Position badges always include text labels (not color-only)
  - DES-097 form validation ARIA fully implemented
  - Agent-voiced error copy throughout (razzleError, getErrorText)
  - lab.js screener table has correct caption + scope=col pattern

### Cycle 12 Findings: aria-sort, Error Recovery, Screener Interactive Keyboard Gaps

Three new audit dimensions this cycle — aria-sort on sortable tables, error recovery UX, and systematic review of every interactive element in screener rows:

- **ZERO aria-sort attributes in the entire codebase** (DES-117) — 50+ sortable tables across 46 pages, all using visual arrows (Unicode &#9650;/&#9660;) but never setting aria-sort="ascending"/"descending" on the `<th>`. This is the single largest remaining WCAG gap for the screener's accessibility story. The fix is straightforward: state.sortKey and state.sortDir already exist.
- **No retry button on API errors** (DES-118) — error messages say "try again" as plain text, but there's no clickable retry button. Toast auto-dismisses after 2.5 seconds. First-time visitors from Reddit who hit a Render cold-start timeout see an error flash and then nothing. Previous data is preserved (good), but the recovery path is invisible.
- **No offline/connection detection** (DES-119) — zero navigator.onLine checks, zero offline event listeners. Mobile traffic (primary from Twitter/Reddit) frequently has intermittent connectivity. Silent failures look like the site is broken.
- **Sparkline & Notes column headers missing keyboard attrs** (DES-120) — the only two column header types in the screener that skip tabindex="0" and onkeydown. Every other column header (100+) has both. Same code file, different code path.
- **Tag picker icon is a span onclick** (DES-121) — no role, no tabindex, no onkeydown. Appears in every screener row. Keyboard users can't tag players.
- **Notes cell is a td onclick** (DES-122) — same pattern as tag picker. No role, no tabindex, no onkeydown. Keyboard users can't add notes.
- **Column group headers missing keyboard** (DES-123) — th onclick without tabindex or onkeydown. The G-key toggle works, but clicking a specific group header to collapse it requires a mouse.
- **Row rank/expand td not keyboard accessible** (DES-124) — clicking the rank number expands weekly stats. No role, no tabindex, no aria-expanded, no onkeydown.
- **Saved views load action is a div onclick** (DES-125) — in the manage modal, the load action is mouse-only. Delete IS a button (correct).
- **Column resize handles not keyboard accessible** (DES-126) — mousedown only, no role="separator", no arrow key handlers.

### Verified CLEAN This Cycle
- **Table structure is 100% correct** — all 50 tables across 46 files have `<thead>` and `<tbody>`. lab.html has 2 tbodies (pinned + regular) which is intentional. NO ticket needed.
- **All tables have scope="col"** — the DES-111 fix was already applied. Confirmed across lab.js and standalone pages.
- **No broken internal links** — all 39 unique href targets verified against filesystem. 0 broken.
- **No accidental noindex** — zero robots meta tags with noindex found.
- **Sitemap covers 69/75 pages** — 3 static pages missing (404, compare, prompts) + 3 dynamic templates intentionally excluded. Minor.
- **Filter chips DO have role="button" + tabindex="0" + aria-label** — correctly implemented. Missing only Delete/Backspace key support (Enter works via native role=button).
- **Team chips have role="button" + tabindex="0"** — same pattern as filter chips. Low-priority keyboard gap.

### Issue Categories by Impact (updated DES-126)
1. **P1 — Screener aria-sort** — DES-117 (50+ tables, 0 instances — the last major WCAG gap)
2. **P1 — Error recovery UX** — DES-118 (no retry button — conversion blocker on cold starts)
3. **P1 — Screener row keyboard gaps** — DES-121 (tag picker), DES-122 (notes cell)
4. **P1 — Screener header keyboard gaps** — DES-120 (sparkline/notes headers)
5. **P2 — Resilience** — DES-119 (no offline detection)
6. **P2 — Screener secondary keyboard** — DES-123 (column groups), DES-124 (row expand), DES-125 (saved views)
7. **P2 — Advanced feature keyboard** — DES-126 (column resize handles)
8. **P2 — Prior cycle pending** — DES-107-116 still in pending/

### Emerging Patterns (updated DES-126)
- **The screener's interactive elements follow a clear split:** elements created in the MAIN column header code path (line 1598) have full keyboard+ARIA support. Elements created in SPECIAL code paths (sparkline, notes, tag picker, rank expand) do not. This is a "template vs. exception" pattern — the template is correct, the exceptions are incomplete.
- **Error recovery is a UX gap, not a code gap.** The error handling code is well-structured (apiFetch, agent-voiced messages, graceful degradation). What's missing is the UI affordance for recovery — a button, not just text.
- **Table structure is fully mature.** 50/50 tables have thead+tbody. All scope="col" is correct. The remaining table accessibility issue is purely semantic (aria-sort) not structural.
- **The "onclick on non-button element" pattern is the dominant remaining keyboard gap.** DES-121, 122, 123, 124, 125 are all the same root cause: `<span onclick>`, `<td onclick>`, `<th onclick>`, `<div onclick>` without role/tabindex/onkeydown. A utility function like `makeAccessible(el, label, action)` could solve all of these at once.
- **Things that are GOOD and should be preserved:**
  - Zero rogue font families (confirmed cycle 12)
  - Zero generic "Loading..." text (confirmed cycle 12)
  - Zero gradients in CSS classes
  - Zero cold grays, zero blue-black ink
  - Zero color:white/color:#fff in lab.js or HTML pages
  - Zero 1px borders in lab.js
  - All 75 pages have lang="en"
  - All 75 pages have skip-to-content links
  - All 75 pages have `<nav aria-label="Main navigation">`
  - All 75 pages have `<footer>` element
  - All 75 pages use display=swap for fonts
  - All `<select>` elements have aria-label
  - Position badges always include text labels (not color-only)
  - DES-097 form validation ARIA fully implemented
  - Agent-voiced error copy throughout (razzleError, getErrorText)
  - lab.js screener table has correct caption + scope=col
  - All 50 tables have proper thead+tbody structure (confirmed cycle 12)
  - All internal links are valid (0 broken, confirmed cycle 12)
  - No accidental noindex directives (confirmed cycle 12)
  - Filter/team chip remove buttons have role=button + tabindex + aria-label
  - Previous data preserved on fetch failure (graceful degradation)
  - AbortController prevents race conditions on rapid re-queries

### What to Check Next (Cycle 13)
- After DES-107-116 (pending): verify all 10 pending fixes are implemented correctly
- After DES-117: verify aria-sort updates dynamically on sort click in screener + standalone pages
- After DES-118: verify retry button appears on API error, doesn't auto-dismiss, re-triggers the last action
- After DES-121-122: verify tag picker and notes cell are tabbable and activatable by Enter/Space
- `lab-panels.js` interactive elements — are panel-specific buttons/chips keyboard accessible? (deferred from cycle 12)
- Print CSS for key pages — rankings, tiers, trade values, cheat sheet (only cheatsheet has @media print)
- Page-specific og:image for high-share pages — trade values, dynasty rankings, breakout finder
- `autocomplete` attribute on auth form inputs — are email/password fields hinting correct types?
- Service Worker / PWA consideration — is there a manifest.json for "add to home screen"?
- CSP headers — is Content-Security-Policy set? Would inline event handlers (onclick, onerror) break if CSP is added?
