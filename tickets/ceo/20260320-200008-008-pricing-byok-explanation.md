---
id: 20260320-200008-008
severity: P1
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Pricing
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## BYOK (Bring Your Own Key) is dropped cold on the pricing page with no explanation for non-technical users

**PRIORITY: P1** | **Type: structural**
**Page**: pricing.html
**Found by**: Razzle (CEO Review)

The Pro tier says "20 AI queries/day (bring your own API key)" and "BYOK." A fantasy football manager who doesn't know what an API key is -- which is most of them -- reads this and thinks "this isn't for me." The distinction between Pro (BYOK) and Elite (AI included) is THE most important pricing decision a potential customer makes, and it's communicated through jargon.

**BEFORE** (what it is now):
- Pro card: "20 AI queries/day (bring your own API key)" and "BYOK"
- Elite card: "Unlimited AI queries (included)" and "no API key needed"
- No explanation of what BYOK means, how much it costs, or why someone would choose it
- FAQ mentions BYOK but the answer assumes technical familiarity

**AFTER** (what it should be):
- Pro card: "20 AI queries/day -- you provide the AI (free API key from OpenRouter)" with a small info tooltip or expandable section explaining: "An API key lets you use your own AI credits. Most users spend $1-3/month. We'll walk you through setup in 60 seconds."
- Elite card: "Unlimited AI queries -- AI included, nothing else to set up"
- Add a comparison callout between Pro and Elite: "Pro and Elite have the same features. The only difference is who provides the AI. Pro: you bring a free API key ($1-3/month in usage). Elite: we handle everything."
- Remove the acronym "BYOK" entirely from user-facing copy. Nobody outside tech knows what BYOK means.

**WHY**: The Pro/Elite distinction is elegant from a business model perspective but confusing from a user perspective. The pricing page is the last stop before conversion. Any confusion here is lost revenue. Explaining BYOK in plain English -- with a cost estimate ("$1-3/month") and a simplicity promise ("60-second setup") -- turns a scary technical requirement into a money-saving option.

### Task 1: Rewrite Pro/Elite AI key descriptions in plain English
**Accept when**: The pricing page explains the Pro/Elite AI key difference without using the acronym "BYOK," includes estimated monthly cost for Pro API usage, and makes Elite feel like the "easy button" for non-technical users.
