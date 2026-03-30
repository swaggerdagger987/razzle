# DES-252: JSON-LD missing WebSite schema with SearchAction for sitelinks

**Priority**: P2
**Area**: index.html
**Cycle**: 24

## Problem

The JSON-LD on index.html (line 28-64) only has `"@type": "WebApplication"`. It's missing a `"@type": "WebSite"` schema with `potentialAction: SearchAction`.

Google uses WebSite+SearchAction to enable the sitelinks search box in SERPs — the search input that appears directly in Google results. This is free SERP real estate that drives users directly to the Screener.

The Screener already supports URL-based search: `/lab.html?search=Bijan Robinson` works. The SearchAction just tells Google about it.

## Evidence

- `index.html:28-64` — only WebApplication schema, no WebSite
- `/lab.html?search=` URL parameter already functional
- Ctrl+K command palette also supports player search

## Fix

Add a second JSON-LD block to index.html:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://razzle.lol",
  "name": "Razzle",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://razzle.lol/lab.html?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

## Why This Matters

When someone googles "razzle fantasy football", the SERP result could show a search box that lets them search for a player directly from Google — landing on the Screener with results ready. Zero cost, high visibility.
