# DES-148: pricing.html Twitter link missing rel="noopener noreferrer"

**Priority**: P2
**Category**: Security / Link Safety
**Affects**: pricing.html line 456
**Cycle**: 14

## Problem

The Twitter link on the pricing page uses `target="_blank"` without `rel="noopener noreferrer"`. This is the ONLY external link in the entire codebase missing this attribute. All other external links (about.html, agents.html) correctly include `rel="noopener"`.

## Evidence

`pricing.html:456`:
```html
<a href="https://twitter.com/razzle_lol" target="_blank" style="color:var(--orange);">@razzle_lol</a>
```

Compare with `about.html:253`:
```html
<a href="https://reddit.com/r/DynastyFF" target="_blank" rel="noopener">r/DynastyFF</a>
```

## Fix

Add `rel="noopener noreferrer"` to the link:
```html
<a href="https://twitter.com/razzle_lol" target="_blank" rel="noopener noreferrer" style="color:var(--orange);">@razzle_lol</a>
```

## Why it matters

Security best practice. Without `rel="noopener"`, the opened page can access `window.opener` and potentially redirect the pricing page. Low actual risk for Twitter, but Lighthouse flags it and security-conscious Reddit users will notice.
