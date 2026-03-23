# DES-096: Standalone panel pages loading/error states missing aria-live

**Priority**: P2
**Area**: 60+ standalone HTML pages (all pages with fetch + dynamic content)
**Cycle**: 9

## Problem

Standalone panel pages (aging.html, breakouts.html, buysell.html, etc.) fetch data from APIs and display loading states, error messages, and result counts — all without `aria-live` regions. Screen readers never announce:

- When data is loading ("scanning the tape...", "running the numbers...")
- When data finishes loading and content appears
- When an error occurs ("failed to load data")
- When result counts update

### Example pattern (breakdown.html)

```javascript
// Loading state — no aria-live
container.innerHTML = '<div class="bd-loading">pulling film...</div>';

// Error state — no aria-live
container.innerHTML = '<div class="bd-error">Failed to load data</div>';

// Results appear — no announcement
container.innerHTML = resultHTML;
```

This pattern repeats across all 60+ standalone pages. Only `agents.html` has `aria-live="polite"` on its briefing cards container.

### Most impactful pages (Pro conversion pathway)

- breakouts.html, buysell.html, efficiency.html, consistency.html — these are Lab panels that convince users to upgrade
- aging.html, explorer.html — visual chart pages where screen readers already miss the canvas content

## Fix

Add `aria-live="polite"` and `role="status"` to the main content container on each page:

```html
<div id="bdContent" role="status" aria-live="polite">
  <!-- Loading, error, and result content renders here -->
</div>
```

Or set it on the loading/error divs specifically:

```javascript
container.innerHTML = '<div class="bd-loading" role="status" aria-live="polite">pulling film...</div>';
```

Use `polite` — these are informational, not urgent.

## Design Rule

WCAG 2.1 SC 4.1.3: Status Messages. Dynamic content changes (loading → results, or loading → error) must be announced via aria-live. The agent-voiced loading states ("scanning the tape...", "running the numbers...") are personality that should be heard, not just seen.
