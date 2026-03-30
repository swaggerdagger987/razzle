---
id: RC-001
priority: P2
type: root cause
status: open
---

# Root Cause: chunky sticker aesthetic not applied to 4+ pages

## Pattern

These tickets all describe the same underlying issue — pages were built without applying DESIGN.md's sticker/chunky card rules:

| Ticket | Page | Missing |
|--------|------|---------|
| DES-335 (202) | Home discovery chips | No box-shadow, no sticker lift |
| DES-342 (203) | Prompts category headers | Flat orange strips, no card treatment |
| DES-330 (206) | Home free pricing card | No badge, no colored border, link CTA |
| DES-337 (208) | Compare empty state | Barren sand, no illustration or card |

## Root cause

No shared "chunky card" component or checklist exists. Each page was implemented independently, and the developer either didn't reference DESIGN.md or interpreted it differently.

## Recommendation

After fixing these 4 tickets individually, consider:
1. A CSS audit grep for cards missing `box-shadow: *px *px 0` — any card without the offset shadow is likely non-compliant
2. A shared `.card-chunky` base class (like DES-210 does for `.card-hero`) that new pages can apply by default

## Related tickets (not in this batch)
- DES-210 (210): Adding `.card-hero` / `.card-spotlight` — same spirit, different scope
- DES-207 epic (about page): Same pattern on about.html
