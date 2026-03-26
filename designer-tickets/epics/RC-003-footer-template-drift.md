<!-- PM: root cause -->
---
id: RC-003
priority: P3
type: root cause
status: open
tickets: 312, 313, 314, 315, 316
---

# Root Cause: No shared footer template across 70+ standalone pages

## Pattern

5 tickets (312-316) all describe the same problem: footer content is copy-pasted across every standalone HTML page with no include/template mechanism. When a new link is added (e.g., prompts.html), it must be manually added to every page.

- **312** — remove hardcoded /team/KC from all footers
- **313-316** — add /prompts.html to footers across 67 pages (4 batches)

## Why this keeps happening

Each standalone page has its own `<footer>` block. There is no shared include, web component, or JS-injected footer. Every footer change requires touching every file.

## Suggested systemic fix (future)

Create a `footer.js` that injects a standard footer into every page, or use a build-time HTML include. This would reduce footer tickets to a single-file change. Not urgent — the current batched approach works — but this root cause will generate more tickets every time a footer link changes.

## For now

Execute 312-316 as written. They're small, mechanical, and correctly batched.
