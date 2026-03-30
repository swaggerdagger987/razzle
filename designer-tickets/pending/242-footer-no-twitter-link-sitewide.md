# DES-242: Footer says "made for Reddit" but has no Twitter link — 73 pages

**Priority:** P1 — distribution channel gap
**Page:** sitewide (73 pages with footer)
**Cycle:** 23

## Problem

Every page footer (line 913 on index.html, equivalent on 72 other pages) reads:

```html
<p style="text-align:center; margin-top:6px;">made for Reddit | <a href="/about.html" style="color:var(--ink-light);">attribution &amp; privacy</a></p>
```

Two issues:

1. **No Twitter link anywhere in the footer.** Phase 1 (current phase) is Twitter launch. @razzle_lol is the primary distribution channel. The only Twitter link on the entire site is buried in pricing.html:456 (student/military discount FAQ). Users who want to follow or engage cannot find the Twitter handle from any page's footer.

2. **"made for Reddit" is premature.** Phase 3 (April-May) is Reddit seeding. The Reddit community doesn't know Razzle exists yet. When early Twitter visitors click "made for Reddit," they'll search Reddit and find nothing — creating a credibility gap.

DES-235 covers the about.html Contact section missing Twitter. This ticket covers the footer itself, which appears on 73 pages and is the most visible global navigation element.

## Fix

```html
<p style="text-align:center; margin-top:6px;">
  <a href="https://twitter.com/razzle_lol" target="_blank" rel="noopener" style="color:var(--ink-light);">@razzle_lol</a> |
  <a href="/about.html" style="color:var(--ink-light);">attribution &amp; privacy</a>
</p>
```

Remove or defer "made for Reddit" until Reddit presence is established. Replace with Twitter handle, which is the active distribution channel.

## Why this matters

Every page on razzle.lol has a footer. The footer is where users go to find social links. The primary growth channel (Twitter) is invisible from every page. Meanwhile, a channel that doesn't exist yet (Reddit presence) is prominently featured. This is backwards for the current roadmap phase.
