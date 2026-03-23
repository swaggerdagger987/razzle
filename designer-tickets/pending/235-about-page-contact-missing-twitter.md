# DES-235: About page Contact section missing Twitter handle

**Priority:** P2 — discoverability
**Page:** about.html
**Cycle:** 22

## Problem

about.html:249-256: The Contact section lists:
- Reddit: r/DynastyFF and r/fantasyfootball links
- Domain: razzle.lol

Missing: Twitter (@razzle_lol), which is the PRIMARY distribution channel per ROADMAP.md Phase 1.

The about page is linked from every page's footer ("attribution & privacy" — 75 pages). It's the first place users look when they want to reach the team. The Twitter handle exists on pricing.html:456 (Student/Military discount DM) but is absent from the Contact section where it belongs.

## Fix

Add Twitter to the contact list:

```html
<li>Twitter: <a href="https://twitter.com/razzle_lol" target="_blank" rel="noopener">@razzle_lol</a></li>
```

Place it before the Reddit links (Twitter is the primary channel).

## Why this matters

Phase 1 is Twitter launch. Phase 2 is Reddit seeding. If someone discovers Razzle, likes it, and wants to follow or engage — the about page should make the Twitter handle instantly findable. Currently it requires finding the fine print on the pricing page's discount section.
