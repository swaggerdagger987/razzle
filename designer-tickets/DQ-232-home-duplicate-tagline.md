---
id: DQ-232
priority: P2
category: copy / home page
pages: index.html
status: open
cycle: 33
---

# Duplicate tagline on home page — "the tool your leaguemates don't know about yet" appears twice

## What's wrong

The same tagline appears twice in the social proof section:
- Line 731: `<p>The tool your leaguemates don't know about yet.</p>` (capitalized, intro paragraph)
- Line 746: `<p style="font-family:var(--font-hand); font-size:14px; ...">the tool your leaguemates don't know about yet.</p>` (lowercase, Caveat font, closing line)

Repeating the exact same phrase 15 lines apart looks like a copy-paste oversight, not intentional reinforcement. The second instance (Caveat font) tries to be a clever sign-off but just reads as redundant.

## Fix

Replace the second instance (line 746) with a different Caveat sign-off that adds new information:

```html
<p style="font-family:var(--font-hand); font-size:14px; color:var(--ink-light); margin-top:16px;">
  your edge, not theirs.
</p>
```

Or remove it entirely — the section works without a closing quip.

## Verification

Read the social proof section aloud. No phrase should repeat.
