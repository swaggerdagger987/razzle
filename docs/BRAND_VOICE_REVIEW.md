# Razzle — Brand Voice Review

**Date**: 2026-03-12
**Scope**: Full brand voice audit for razzle.lol, targeting Reddit fantasy football power users (r/DynastyFF, r/fantasyfootball, r/SleeperApp, r/FantasyFootballers)
**Sources Reviewed**: Landing page (index.html), Situation Room page (agents.html), Design Guide, North Star

---

## Summary

Razzle's current voice is **strong and differentiated**. The "Bloomberg terminal disguised as a Sunday comic strip" positioning is clear, the mascot personality lands, and the copy consistently respects the reader's intelligence — which is exactly what Reddit power users respond to. The biggest strengths are the Research Sprawl infographic (perfectly names a pain point every fantasy manager recognizes) and the dry annotation layer (Caveat font asides that feel like a friend's margin notes, not marketing copy).

The most important improvements are: tightening a few lines that drift into generic SaaS marketing language, adding more Reddit-native social proof, and sharpening the pricing copy so the value proposition of BYOK vs. Elite is immediately legible to a skeptical power user who assumes AI products are overpriced.

---

## Detailed Findings

### Voice & Tone

| Issue | Location | Severity | Suggestion |
|-------|----------|----------|------------|
| Hero sub-line includes "razzle.lol" URL inline | Hero subtitle | Low | The URL reads as self-promotion. Reddit users distrust overt marketing. Move URL to watermark/footer only; let the hero breathe. |
| "The tool Reddit power users can't stop screenshotting" | Meta description + Features section | Medium | This is aspirational, not yet earned. Before launch it reads as fake social proof. Replace with a factual differentiator until real screenshot traction exists. |
| "Free Forever" label | Features section | Low | "Free Forever" is SaaS jargon. Reddit users pattern-match this to products that eventually paywall. Consider "The Lab — Always Free" or just "The Lab — Free" — understated confidence > promises. |
| "best value" badge on Elite tier | Pricing section | Medium | "Best value" is generic pricing page language. Razzle's voice is drier than this. Consider "the one Razzle would pick" or "no API key hassle" — something that sounds like the brand, not a template. |
| Feature card descriptions are slightly generic | Feature cards (NFL Screener, College Screener, etc.) | Medium | Lines like "1200+ players, 60+ metrics" are stat dumps. They're accurate but they don't sound like Razzle. Rework to combine data specificity with voice: lead with what makes it feel different, not just what's big. |
| "Every screenshot is a billboard" | Share to Reddit feature card | Low | Clever line but it reveals the business model too directly. Reddit users will roll their eyes at being called a "billboard." Consider "Every screenshot starts arguments. Good." |
| Mascot bio is excellent | Mascot section | — (strength) | "Doesn't brief you because he has to — briefs you because he's already figured it all out" is perfect voice. This is the template for all copy. |
| Research Sprawl section is excellent | Sprawl infographic | — (strength) | "12 tabs open, 6 podcasts queued, 3 Twitter threads half-read" — this is exactly how Reddit power users describe their own workflow. Perfect naming of a real pain. |
| Annotation layer is excellent | Sprawl annotations | — (strength) | "^ this is you on Tuesday night" and "^ narrator: he was a sell" — perfect dry wit. This is the brand's secret weapon. |

### Terminology & Language

| Issue | Location | Severity | Suggestion |
|-------|----------|----------|------------|
| "Bloomberg terminal" metaphor | Hero, meta descriptions | Low | Strong metaphor. Works because r/DynastyFF and r/fantasyfootball users already joke about wanting a "Bloomberg for fantasy." No change needed — just ensure it's used sparingly (hero + one reinforcement, not every page). |
| "AI agents" vs. "specialist agents" | Various | Low | Be consistent. "AI agents" triggers skepticism on Reddit ("just another wrapper"). "Specialist agents" or just "agents" sounds more like a capability, less like a buzzword. |
| "League-contextualized analysis" | Pricing bullet | Medium | This is a feature spec phrase, not user-facing copy. A Reddit user would say "it knows my league." Rewrite as: "Agents that know your league, your rivals, your scoring" |
| "BYOK" | Pricing section | Medium | Acronym is clear to developers but opaque to many Reddit fantasy users. First mention should spell out: "Bring your own API key — use your own OpenRouter or Anthropic key" |

### Messaging Pillars Alignment

The North Star defines three value propositions: context awareness, LLM convenience, stat discoverability. The landing page covers all three but the weighting is uneven:

| Pillar | Coverage | Notes |
|--------|----------|-------|
| Stat discoverability | Strong | The Lab features section and Research Sprawl nail this |
| Context awareness | Medium | Mentioned in Situation Room demo but could be more concrete — show what "knowing your league" actually means with a specific example |
| LLM convenience | Weak | "No copy-pasting stats into ChatGPT" is the killer pitch but it's buried. This should be much more prominent because Reddit users currently DO paste screenshots into ChatGPT and hate it |

### Reddit-Specific Voice Calibration

Reddit fantasy football communities have a very specific communication style. The brand should mirror:

**What Reddit power users respect:**
- Precision over hype (show the stat, don't just claim it)
- Dry humor over enthusiasm (period over exclamation mark — the design guide already nails this)
- Self-deprecation and in-group jokes (draft busts, league drama, "my team is garbage but the data says...")
- Process transparency ("here's how I built this score" > "trust our proprietary algorithm")
- Skepticism toward paid tools (the free tier must be genuinely powerful or they'll dismiss the whole thing)

**What Reddit power users reject:**
- Influencer-marketing language ("game-changer," "next level," "unlock your potential")
- Fake urgency ("limited time," "act now," "spots filling up")
- Over-promising ("guaranteed wins," "never lose again")
- Corporate polish (stock photos, generic testimonials, "trusted by thousands")
- Paywalling basic data (they'll go elsewhere and badmouth you)

**Current alignment: 8/10.** Razzle's voice already avoids most anti-patterns. The main gap is a few lines that sound like SaaS landing page templates rather than a tool built by someone who's in the same subreddits as the user.

---

## Top 5 Revisions (Before → After)

### 1. Hero Subtitle
**Before**: "The terminal is free. The agents know your league. razzle.lol"
**After**: "The terminal is free. The agents know your league."
*Remove the URL — it's already in the browser bar, the watermark, and the footer. Including it in the hero makes it feel like a pitch deck, not a product.*

### 2. Feature Section Header
**Before**: "The tool Reddit power users can't stop screenshotting."
**After**: "One terminal instead of twelve browser tabs."
*Earn the Reddit screenshot reputation through actual usage, don't claim it before it exists. The twelve-tabs line echoes the Research Sprawl section and reinforces stat discoverability.*

### 3. Pricing — "Best Value" Badge
**Before**: "best value"
**After**: "razzle's pick" *(with the slightly rotated sticker aesthetic)*
*Stays on-brand with the mascot personality. Razzle recommends this tier, not a pricing template.*

### 4. Pricing — Pro Bullet
**Before**: "League-contextualized analysis"
**After**: "Agents that know your roster, your rivals, your scoring"
*Concrete and personal. Uses "your" three times — makes the reader picture their own league.*

### 5. Share to Reddit Card
**Before**: "One-click PNG export with watermark. Shareable URLs. Auto-generated Reddit titles. Every screenshot is a billboard."
**After**: "One-click PNG export. Shareable URLs. Auto-generated Reddit post titles. Every screenshot starts arguments."
*Removes "billboard" (reveals monetization motive) and "watermark" (sounds like a limitation, not a feature). "Starts arguments" is more Reddit-native — that's what good fantasy content does.*

---

## Legal / Compliance Flags

| Flag | Location | Severity | Action |
|------|----------|----------|--------|
| No Terms of Service or Privacy Policy linked | Footer | High | Must add before launch. Required for Stripe, AdSense, and general liability. |
| "Free Forever" could be construed as binding | Features section | Medium | If you ever change the free tier, this phrase could create backlash. "Always Free" or "Free" is less absolute. |
| No BYOK data handling disclosure | Pricing / Situation Room | Medium | Users providing their own API keys need to know: are keys stored? encrypted? transmitted to your server? A one-line disclosure builds trust. |
| Player likeness / headshot sourcing | Throughout | Medium | If using NFL player headshots, ensure proper licensing or use stylized/illustrated alternatives. |

---

## Voice Cheat Sheet (for all future copy)

| Dimension | Razzle Voice | Not This |
|-----------|-------------|----------|
| Confidence | "just edge." | "the ultimate edge!" |
| Humor | "^ narrator: he was a sell" | "LOL this player is a BUST" |
| Precision | "329 scored prospects" | "hundreds of prospects" |
| Self-reference | "razzle already figured it out" | "our AI-powered platform" |
| CTAs | "open the lab" | "get started free today!" |
| Loading states | "pulling film..." | "loading..." |
| Pricing | "the lab is free. the agents work for subscribers." | "unlock premium features" |
| Tone register | Film room conversation | Sales pitch |
| Punctuation | Period. | Exclamation mark! |
| User assumption | You already know fantasy football | "What is fantasy football?" |
