# DES-221: Duplicate "leaguemates don't know about yet" copy on home page

**Priority**: P2 (Copy polish — reads as lazy, weakens section)
**Page**: index.html
**Category**: Copy quality

## The Problem

The social proof section on the home page uses the same phrase twice within 15 lines:

- **Line 731** (h2 subtitle): `<p>The tool your leaguemates don't know about yet.</p>`
- **Line 746** (Caveat annotation): `<p style="font-family:var(--font-hand);">the tool your leaguemates don't know about yet.</p>`

The Caveat annotation is supposed to be a margin note — a personality aside that adds something the headline didn't say. Per DESIGN.md: "Caveat is never primary information. Always a comment, aside, margin note." Repeating the subtitle verbatim makes the annotation feel like a copy-paste error, not a personality touch.

## Evidence

The phrase also appears 3x in meta tags (og:description, twitter:description, description) which is correct — those are for external sharing. The on-page duplication is the issue.

## The Fix

Keep line 731 as-is. Change line 746's Caveat annotation to something that adds value:

Options:
- `"first-mover advantage is real"`
- `"wait till they see your screenshots"`
- `"their 6 browser tabs can't compete"`
- `"you found it first. use that."`

Any of these add personality and forward momentum. The current duplicate just echoes.

## Why This Matters

The home page is the first impression. Repeated copy in the same viewport makes the site feel rushed. A unique Caveat annotation reinforces that every detail has personality — which is the brand promise (Sunday comic strip that's a research lab).
