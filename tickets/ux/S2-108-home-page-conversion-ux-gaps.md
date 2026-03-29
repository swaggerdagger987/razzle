---
id: S2-108
severity: S2
confidence: HIGH
category: ux
source: DQ-053+054+055+057+059+081+209+232+349+354+360+374+376+456
status: OPEN
---

# Home page conversion UX gaps — 14 issues reducing signup likelihood

## Problems

1. **Feature cards use system emoji as icons** (DQ-053) — "What You Get" section uses generic emoji (chart, magnifying glass) instead of custom illustrations or agent avatars. Looks low-effort.
2. **"Connect Your League" section has no visual** (DQ-054) — Text-only pitch for league import with no screenshot, mockup, or preview of what connected leagues look like.
3. **Brand mascot is system emoji** (DQ-055) — Tiger mascot rendered via Unicode emoji rather than custom SVG illustration. First impression looks template-ish.
4. **Dashboard cards missing position stripe** (DQ-057) — Top-5 player cards lack the 6px colored top stripe that other cards have.
5. **Agent demo card uses wrong name** (DQ-059) — Home page Situation Room demo references "Bones" instead of the correct agent name.
6. **Feature cards have no hover lift** (DQ-081) — Static cards while rest of site has hover animations. Dead feeling.
7. **Missing watermark** (DQ-209) — Home page has no razzle.lol watermark element.
8. **Duplicate tagline** (DQ-232) — "the tool your leaguemates don't know about yet" appears twice.
9. **Section CTAs override btn-hero sizing inline** (DQ-349) — Inline styles instead of class.
10. **Bureau section doesn't clarify free vs Pro** (DQ-354) — Users don't know what they get before signing up.
11. **Smart chips claim "update live" without offseason context** (DQ-360) — Misleading during NFL offseason.
12. **pricing-card vs plan-card class split** (DQ-374) — Home and pricing pages define same element differently.
13. **Pro tier claims "6 AI agents" misleading for BYOK** (DQ-376) — Implies included AI, but user must bring their own key.
14. **Pricing/demo/social cards have no hover lift** (DQ-456) — Same static issue.

## Files

- `frontend/index.html` — all issues
- `frontend/styles.css` — hover lift class, watermark

## Acceptance Criteria

1. Feature cards use agent avatars or custom icons, not emoji
2. "Connect Your League" shows a visual preview
3. Duplicate tagline removed
4. Hover lift on all interactive cards
5. Agent demo card uses correct agent name
6. Bureau section clarifies free vs Pro features
