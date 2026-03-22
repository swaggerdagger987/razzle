# DES-005: Prompts page has minimal footer — conversion dead end

**Priority**: P2
**Area**: prompts.html (footer)
**Impact**: Conversion funnel leak — SEO traffic lands here, scrolls to bottom, finds no path to Pricing or Screener

## What's Wrong

`prompts.html` has a 2-line footer:
```html
<footer class="site-footer">
  <p style="text-align:center;"><a href="/" ...>razzle.lol</a></p>
  <p style="text-align:center; margin-top:6px;">made for Reddit | <a href="/about.html" ...>attribution & privacy</a></p>
</footer>
```

All 4 other main pages (index.html, agents.html, league-intel.html, pricing.html) have the full 6-column navigation footer with Razzle / Dynasty / Weekly / Analytics / Tools columns + ~40 links.

## Why It Matters

The prompts page is an SEO/conversion funnel page. Users searching "fantasy football ChatGPT prompts" land here. The prompts are tagged with agent names (Razzle, Bones, Hawkeye, Octo) — the whole point is to introduce the agents and drive users into the product.

After scrolling through 15+ prompts, the user hits the bottom and finds zero links to Pricing, the Screener, the Lab, or any other product page. That's a dead end at the moment users are most curious about the agents they just read about.

## Fix

Replace the minimal 2-line footer in `prompts.html` (lines 133-136) with the full 6-column footer grid used in `index.html` (lines 841-912). Copy the exact footer block from index.html.

## Files to Edit

- `frontend/prompts.html` — lines 133-136 (replace minimal footer with full footer)

## Verification

- Open prompts.html in browser
- Scroll to bottom
- Confirm 6-column footer grid with links to Pricing, Screener, Dynasty panels, etc.
- Confirm "razzle.lol" link and "made for Reddit" tagline below the grid
