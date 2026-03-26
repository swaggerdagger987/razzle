# CEO-036: "Made By One Person" Founder Credibility Line

**ID**: 20260321-160006-036
**Page**: Landing
**Type**: structural
**Severity**: P2
**Created**: 2026-03-21 (CEO Review #3)

## Problem

The landing page has no social proof or founder credibility. Reddit's fantasy football community has a strong affinity for solo builders and passion projects. "I built this myself" is one of the highest-engagement post types on r/DynastyFF and r/fantasyfootball.

## BEFORE

Footer ends with:
```html
<p>made for Reddit | <a href="/about.html">attribution & privacy</a></p>
```

No indication this is a solo project. Could be a VC-funded startup. Could be a corporate side project. The personality that would make Reddit care is invisible.

## AFTER

Footer line becomes:
```html
<p>built by one person for the community | <a href="/about.html">the story</a></p>
```

Or a small section above the footer:
```html
<div class="founder-line">
  <p style="font-family:var(--font-hand); font-size:18px; color:var(--ink-medium);">
    Built by one fantasy degenerate who got tired of spreadsheets.
  </p>
</div>
```

## Why

- Reddit rewards authenticity and solo builders
- "Made for Reddit" is corporate speak. "Built by one person" is human.
- This adds founder credibility without needing a full About page rewrite
- The "about.html" link text "the story" invites curiosity

## Acceptance Criteria

- [ ] Landing page communicates solo-builder origin somewhere visible
- [ ] Tone matches Razzle brand voice (playful, not humble-brag)
- [ ] Links to About page for the full story
