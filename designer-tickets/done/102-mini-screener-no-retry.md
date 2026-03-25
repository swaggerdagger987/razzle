<!-- PM: ready -->
---
id: DES-353
priority: P1
area: index.html
section: mini-screener error state
type: ux / error handling
status: open
---

# Home mini-screener has no retry button on API failure

## What's wrong

When the mini-screener API call fails (line 1032-1036), the error message shows:

> "couldn't reach the film room. open the screener directly."

The "open the screener" link goes to /lab.html, which is a reasonable fallback. But there's no retry button. The fetch is a one-shot call on page load. If it fails (Render cold start, network blip, timeout), the user's only option is to reload the entire page or click through to the Lab.

DES-118 (done) added retry buttons to Lab/panels error states but did NOT address the home page mini-screener, which is a separate code path in index.html (not lab.js or app.js).

## Where

- `frontend/index.html` lines 1032-1036: `.catch()` handler for mini-screener fetch
- The fetch at line 1018 has no AbortController timeout either (DES-247 is pending for that)

## Suggested fix

Add a retry button to the error message:
```javascript
tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; font-family:var(--font-hand); color:var(--ink-light);">' +
  'couldn\'t reach the film room. ' +
  '<a href="#" onclick="_fetchMiniScreener(); return false;" style="color:var(--orange); text-decoration:underline;">try again</a>' +
  ' or <a href="/lab.html" style="color:var(--orange);">open the screener</a> directly.</td></tr>';
```

Extract the fetch into a named `_fetchMiniScreener()` function so it can be called on retry.

## Not a dupe of

- DES-118 (no retry button on API errors) — that was fixed for Lab/panels, not for home page mini-screener
- DES-247 (mini-screener fetch no timeout) — that's about adding AbortController, not retry UX
