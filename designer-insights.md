# Designer Insights

### Cycle 1 — 2026-03-23

**What I did**: Code-based design audit of all frontend files against DESIGN.md. Checked CSS, HTML, and JS for color tokens, border weights, radius tokens, shadow patterns, font usage, and dark mode compliance. Wrote 10 tickets.

**Quality score**: 7/10 — browse tool was non-functional so I couldn't do visual/screenshot verification. All findings are code-level, which is reliable for token violations but misses layout/spacing issues.

**What worked**: Parallel subagent strategy — 3 agents auditing CSS, HTML, and JS simultaneously saved time. Grep patterns for hex colors, 1px borders, and hardcoded radii were effective.

**What didn't**: Browse tool returned empty DOM for both live site and localhost. Couldn't take before/after screenshots.

**Pattern spotted**: The codebase has a consistent pattern of inline styles in JS files (lab.js, charts.js, lab-panels.js) that bypass CSS variables entirely. Canvas operations are the worst offenders since they can't use CSS vars directly — they need getComputedStyle() reads.

**Root cause found**: charts.js has no centralized color/token reading. Each function declares its own color maps independently. A single `getComputedStyle()` read at module init would fix DQ-007 and DQ-008 together.

**Suggestion for teammates**: Ship agent should fix DQ-001 first (1-line change, biggest blast radius — every dark mode page). DQ-002 + DQ-003 together (button shadows + hover lift) will make the biggest visual difference.

**What I'd do differently next time**: Get the local dev server with backend running so browse tool can capture full rendered pages. Layout/spacing issues are invisible in code-only audits.
