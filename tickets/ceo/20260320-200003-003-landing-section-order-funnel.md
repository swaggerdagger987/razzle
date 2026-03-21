---
id: 20260320-200003-003
severity: P0
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Landing Page
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## Landing page section order doesn't follow the conversion funnel

**PRIORITY: P0** | **Type: structural**
**Page**: index.html
**Found by**: Razzle (CEO Review)

The landing page currently shows: Hero -> Screener preview -> Bureau section -> AI Agents section -> Pricing. This front-loads paid features and pricing before the user has felt any value. The north star's conversion funnel is: Screener (free, hooks them) -> Bureau (personal, creates need) -> Situation Room (premium, justifies price) -> Pricing (converts).

The landing page should follow this same funnel. But it should spend MORE space on the free stuff (what you get today) and LESS space on the paid stuff (what you get after you're hooked).

**BEFORE** (what it is now):
1. Hero (ChatGPT comparison)
2. Screener preview (static mockup, small)
3. Bureau section ("Connect your Sleeper league")
4. AI Agents section (redacted briefings)
5. Pricing (3 tiers)

**AFTER** (what it should be):
1. Hero (Screener value prop -- "The fantasy football research lab. Forever free.")
2. Live mini-screener (real data, interactive -- see ticket 002)
3. Feature showcase: 3-4 cards highlighting Screener superpowers (custom formulas, 100+ columns, smart filters, shareable views + PNG export)
4. Social proof / screenshot gallery (even if fabricated for now -- show what a screener screenshot looks like in a Reddit post or group chat context)
5. Bureau section ("Now connect your league" -- positioned as the natural next step AFTER you've used the Screener)
6. Situation Room teaser (show one compelling, UNREDACTED example briefing -- not blacked-out text)
7. Pricing (LAST -- after the user has seen all the value)

The key structural change: double the real estate for the free Screener, halve the real estate for paid features. The landing page's job is to get someone into the Screener, not to sell them Pro.

**WHY**: The conversion funnel documented in the north star is Screener -> Bureau -> Situation Room -> Payment. The landing page should mirror this funnel exactly. Front-loading pricing and AI features before the user has experienced ANY value is the classic startup mistake of selling before demonstrating. Every dynasty manager who bounces from the landing page without opening the Screener is a lost conversion.

### Task 1: Restructure landing page sections to follow the conversion funnel
**Accept when**: The landing page dedicates 60%+ of its above-the-fold and near-fold space to the free Screener, introduces Bureau as the natural next step, and positions pricing last.
