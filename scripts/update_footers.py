#!/usr/bin/env python3
"""
Bulk update footers across all HTML files to the modernized 5-column grid layout.
Matches the footer pattern established in index.html during Phase 149.

Three patterns handled:
A) <div class="warroom-footer"> ... </div>  (agents.html)
B) <footer style="..."> ... </footer>  (Lab panels)
C) No footer at all (pricing.html, about.html) — insert before closing scripts/</body>
"""

import os
import re
import sys

FRONTEND = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")

# The canonical modernized footer (matches index.html)
MODERN_FOOTER = '''<!-- FOOTER -->
<div class="site-footer">
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:24px 16px; max-width:900px; margin:0 auto 24px; padding:0 24px; font-family:var(--font-mono); font-size:11px; text-align:left;">

    <div>
      <div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Razzle</div>
      <a href="/" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Home</a>
      <a href="/lab.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">The Lab</a>
      <a href="/league-intel.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">League Intel</a>
      <a href="/agents.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Situation Room</a>
      <a href="/pricing.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Pricing</a>
      <a href="/about.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">About</a>
    </div>

    <div>
      <div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Dynasty</div>
      <a href="/rankings.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Rankings</a>
      <a href="/tradevalues.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Trade Values</a>
      <a href="/tradefinder.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Trade Finder</a>
      <a href="/tiers.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Tiers</a>
      <a href="/vorp.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">VORP</a>
      <a href="/aging.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Aging Curves</a>
      <a href="/buysell.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Buy/Sell</a>
      <a href="/archetypes.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Archetypes</a>
    </div>

    <div>
      <div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Weekly</div>
      <a href="/weekly.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Weekly Stats</a>
      <a href="/weeklyleaders.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Week Leaders</a>
      <a href="/weeklymvp.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Weekly MVP</a>
      <a href="/matchups.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Matchups</a>
      <a href="/waivers.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Waivers</a>
      <a href="/schedule.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Schedule</a>
      <a href="/stocks.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Stocks</a>
      <a href="/playoffs.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Playoffs</a>
    </div>

    <div>
      <div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Analytics</div>
      <a href="/targets.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Targets</a>
      <a href="/usage.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Usage</a>
      <a href="/efficiency.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Efficiency</a>
      <a href="/airyards.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Air Yards</a>
      <a href="/redzone.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Red Zone</a>
      <a href="/consistency.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Consistency</a>
      <a href="/breakouts.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Breakouts</a>
      <a href="/opportunity.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Opportunity</a>
    </div>

    <div>
      <div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Tools</div>
      <a href="/explorer.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Stat Explorer</a>
      <a href="/compare.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Compare</a>
      <a href="/rosterbuilder.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Roster Builder</a>
      <a href="/cheatsheet.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Cheat Sheet</a>
      <a href="/auction.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Auction Values</a>
      <a href="/dashboard.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Dashboard</a>
      <a href="/prospects.html" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Prospects</a>
      <a href="/team/KC" style="color:var(--ink-light); text-decoration:none; display:block; padding:2px 0;">Teams</a>
    </div>

  </div>
  <p style="text-align:center;"><a href="/" style="color:var(--orange); text-decoration:none;">razzle.lol</a> — let's razzle dazzle em baby</p>
  <p style="text-align:center; margin-top:6px;">powered by nflverse + sportsdataverse | made for Reddit | <a href="/about.html" style="color:var(--ink-light);">attribution &amp; privacy</a></p>
</div>'''

# Files to skip (already have the modern footer or are special)
SKIP = {"index.html", "404.html", "lab.html"}

def update_file(filepath):
    """Update footer in a single HTML file. Returns (changed, pattern_type)."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    basename = os.path.basename(filepath)

    # Pattern A: warroom-footer (agents.html)
    pattern_a = re.compile(
        r'<!-- FOOTER -->\s*<div class="warroom-footer">.*?</div>\s*</div>',
        re.DOTALL
    )
    # The warroom-footer has nested divs, so we need a more careful match
    # Find from <!-- FOOTER --> to the closing </div> before <script src="app.js">
    warroom_match = re.search(
        r'(<!-- FOOTER -->\s*<div class="warroom-footer">.*?</div>\s*<p>.*?</p>\s*(?:<p.*?</p>\s*)?</div>)',
        content, re.DOTALL
    )
    if warroom_match:
        content = content.replace(warroom_match.group(1), MODERN_FOOTER)
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            return True, "warroom-footer"

    # Pattern B: <footer style="..."> ... </footer> (Lab panels)
    footer_match = re.search(
        r'(<!-- Footer -->\s*<footer\s+style="[^"]*"[^>]*>.*?</footer>)',
        content, re.DOTALL
    )
    if footer_match:
        content = content.replace(footer_match.group(1), MODERN_FOOTER)
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            return True, "lab-footer"

    # Pattern B2: <footer> without <!-- Footer --> comment
    footer_match2 = re.search(
        r'(<footer\s+style="[^"]*"[^>]*>.*?</footer>)',
        content, re.DOTALL
    )
    if footer_match2:
        content = content.replace(footer_match2.group(1), MODERN_FOOTER)
        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            return True, "lab-footer-nocomment"

    # Pattern C: No footer — insert before first <script> tag before </body>
    # Look for the pattern: no footer exists, insert before closing scripts
    if "site-footer" not in content and "<footer" not in content and "warroom-footer" not in content:
        # Find a good insertion point — before the first <script> near end, or before </body>
        # Try before <script src="app.js">
        app_script = content.rfind('<script src="app.js">')
        if app_script > 0:
            content = content[:app_script] + "\n" + MODERN_FOOTER + "\n\n" + content[app_script:]
        else:
            # Before </body>
            body_end = content.rfind('</body>')
            if body_end > 0:
                content = content[:body_end] + "\n" + MODERN_FOOTER + "\n\n" + content[body_end:]

        if content != original:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            return True, "no-footer-added"

    return False, "skipped"


def main():
    changed = 0
    skipped = 0
    results = []

    for fname in sorted(os.listdir(FRONTEND)):
        if not fname.endswith(".html"):
            continue
        if fname in SKIP:
            skipped += 1
            continue

        filepath = os.path.join(FRONTEND, fname)

        # Skip if already has modern footer
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        if 'grid-template-columns:repeat(auto-fit, minmax(160px, 1fr))' in content:
            results.append(f"  ALREADY MODERN: {fname}")
            skipped += 1
            continue

        was_changed, pattern = update_file(filepath)
        if was_changed:
            changed += 1
            results.append(f"  UPDATED ({pattern}): {fname}")
        else:
            results.append(f"  NO CHANGE: {fname}")
            skipped += 1

    print(f"\nFooter Update Complete")
    print(f"  Changed: {changed}")
    print(f"  Skipped: {skipped}")
    print(f"\nDetails:")
    for r in results:
        print(r)


if __name__ == "__main__":
    main()
