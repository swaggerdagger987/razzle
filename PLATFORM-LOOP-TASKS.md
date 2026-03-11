# Platform Loop — Phase 149 Task List

## Status
Current Phase: 149 (Pre-Launch Polish: Navigation, Copy, and Conversion Funnel Tightening)
Current Task: COMPLETE
Current Stage: PHASE GATE
Attempt: -
Tasks Completed: 6/6
Loop Iterations: 6

---

## Task 1: Fix Outdated Copy — Draft Season 2025 to 2026 + Remove Waitlist
**Requirement**: "Hard Deadline: NFL Draft Week (April 24, 2026)" (ROADMAP.md line 3). Landing page references "Draft Season 2025" which is incorrect. Waitlist section is obsolete — Situation Room is live.
**Accept when**: (1) "Draft Season 2025" changed to "Draft Season 2026" on index.html. (2) Waitlist section replaced with a stronger CTA that links to the live Situation Room or pricing. (3) No other stale date references remain.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND / BRAND
**Status**: PASS
**Notes**: "Draft Season 2025" updated to "Draft Season 2026". Waitlist section replaced with "The Situation Room is live" CTA with dual buttons (Enter Situation Room + Explore The Lab). Rookie Big Board fallback year updated from 2025 to 2026.

## Task 2: Navigation Consistency — Add Bureau + Pricing to Nav
**Requirement**: "Pages: home, lab, bureau, agents" (NORTH_STAR.md line 40-43). Nav currently shows Home, Lab, Situation Room but missing Bureau (League Intel) and Pricing.
**Accept when**: (1) Nav includes League Intel link on all pages. (2) Footer includes Pricing link. (3) Nav order makes funnel sense: Home > Lab > League Intel > Situation Room.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND
**Status**: PASS
**Notes**: League Intel nav link added to all 74 HTML files between The Lab and Situation Room. League Intel page updated with active class on its own nav link. Pricing link added to index.html footer.

## Task 3: Pricing Page FAQ Section
**Requirement**: "Every screen answers: 'why should I upgrade?' without being annoying" (System Prompt, UX Architect role). FAQ reduces conversion friction — answers objections before checkout.
**Accept when**: (1) FAQ section added below feature matrix on pricing.html. (2) Covers 6-8 common questions: What's BYOK? Can I cancel anytime? What's the free trial? What API keys work? Do I need Sleeper? What happens when trial ends? (3) Follows Razzle design system (chunky cards, Caveat annotations).
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND / BRAND
**Status**: PASS
**Notes**: 8-question FAQ section added to pricing.html below feature matrix. Questions cover BYOK, free trial, cancellation, Sleeper requirement, trial expiry, API key compatibility, format support, and free tier commitment. Razzle design system: Display font headers, Mono body text, dashed dividers.

## Task 4: Remove "Coming Soon" Text on Agents Page
**Requirement**: agents.html line 1493 shows "free preview — full Situation Room Pro coming soon" but the Situation Room IS live with full Pro/Elite support.
**Accept when**: (1) "Coming soon" text replaced with accurate copy reflecting that the Situation Room is live. (2) Upsell hint still shows for free users but with correct copy. (3) Pro/Elite users see no upsell hint at all.
**Depends on**: none
**Size**: S
**Primary role**: FRONTEND / BRAND
**Status**: PASS
**Notes**: Updated to "free preview — upgrade to Pro for league-contextualized intelligence". No "coming soon" references remain.

## Task 5: Footer Modernization — Organized Link Categories
**Requirement**: Landing page footer is a massive wall of pipe-separated links (lines 937-1060) that is hard to scan. Needs organization into categories for usability and professionalism before Reddit launch.
**Accept when**: (1) Footer links organized into 4-5 columns (Lab Panels, Dynasty Tools, Weekly Tools, League Tools, Account). (2) Pricing and About links prominently placed. (3) Responsive grid layout. (4) Follows Razzle design system.
**Depends on**: none
**Size**: M
**Primary role**: FRONTEND / DESIGN
**Status**: PASS
**Notes**: Footer reorganized from ~120 pipe-separated links into a 5-column responsive grid: Razzle (core pages), Dynasty (rankings, trades, tiers), Weekly (stats, matchups, waivers), Analytics (targets, usage, efficiency), Tools (explorer, compare, roster builder). CSS grid with auto-fit minmax(160px, 1fr). Orange category headers in Display font, links in Mono font.

## Task 6: Sitemap Completeness Audit
**Requirement**: All public pages must be in the sitemap for SEO. pricing.html, about.html, and league-intel.html should be in the sitemap.
**Accept when**: (1) All public HTML pages are included in the sitemap endpoint. (2) Pricing, about, league-intel, and tools pages confirmed present. (3) No broken or missing pages.
**Depends on**: none
**Size**: S
**Primary role**: BACKEND
**Status**: PASS
**Notes**: Verified: all 70 static HTML pages are in the sitemap. pricing.html, about.html, league-intel.html, agents.html all present. Dynamic pages (player.html, team.html) handled separately with player profiles. 404.html correctly excluded.
