# DQ-101: Agents page footer is light sand on a dark page

**Priority**: P1
**Category**: Dark Mode / Design Spec Violation
**Page**: agents.html
**Evidence**: agents-bottom-desktop.png, agents-footer-transition.png

## Problem

The agents.html page (Situation Room) is dark-themed per DESIGN.md: "Situation Room is always dark regardless of toggle." But the footer at the bottom snaps back to light sand, creating a jarring dark-to-light transition.

The `.warroom-footer` CSS class already exists in agents.html inline styles (line ~1238) with proper dark styling (`background: var(--bg-ink)`), but it is NEVER applied. The actual footer element at line ~2048 uses `class="site-footer"` which renders light.

Additionally, no `data-theme="dark"` is forced on the `<html>` element at page load — dark mode on agents.html depends entirely on the user's global toggle or OS preference.

## Fix

Option A (minimal): Change the footer element from `class="site-footer"` to `class="site-footer warroom-footer"` and ensure warroom-footer overrides the light styles.

Option B (correct): Add a `<script>` in the `<head>` of agents.html that forces `document.documentElement.setAttribute("data-theme", "dark")` on page load. This makes the entire page dark (nav, footer, everything) which is what DESIGN.md intends.

Option B is the right answer. One line of JS, entire page goes dark.

## Verification

After fix: navigate to agents.html in light mode. The entire page (including nav and footer) should be dark. The theme toggle in the nav should still work globally but agents.html should always start dark.
