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
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:24px 16px; max-width:900px; margin:0 auto 24px; padding:0 24px; font-family:var(--font-mono); font-size:11px; text-align:left;">

    <div>
      <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Razzle</div>
      <a href="/" class="footer-link">Home</a>
      <a href="/lab.html" class="footer-link">Screener</a>
      <a href="/league-intel.html" class="footer-link">Bureau</a>
      <a href="/agents.html" class="footer-link">Situation Room</a>
      <a href="/pricing.html" class="footer-link">Pricing</a>
      <a href="/about.html" class="footer-link">About</a>
    </div>

    <div>
      <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Dynasty</div>
      <a href="/rankings.html" class="footer-link">Rankings</a>
      <a href="/tradevalues.html" class="footer-link">Trade Values</a>
      <a href="/tradefinder.html" class="footer-link">Trade Finder</a>
      <a href="/tiers.html" class="footer-link">Tiers</a>
      <a href="/vorp.html" class="footer-link">VORP</a>
      <a href="/aging.html" class="footer-link">Aging Curves</a>
      <a href="/buysell.html" class="footer-link">Buy/Sell</a>
      <a href="/archetypes.html" class="footer-link">Archetypes</a>
    </div>

    <div>
      <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Weekly</div>
      <a href="/weekly.html" class="footer-link">Weekly Stats</a>
      <a href="/weeklyleaders.html" class="footer-link">Week Leaders</a>
      <a href="/weeklymvp.html" class="footer-link">Weekly MVP</a>
      <a href="/matchups.html" class="footer-link">Matchups</a>
      <a href="/waivers.html" class="footer-link">Waivers</a>
      <a href="/schedule.html" class="footer-link">Schedule</a>
      <a href="/stocks.html" class="footer-link">Stocks</a>
      <a href="/playoffs.html" class="footer-link">Playoffs</a>
    </div>

    <div>
      <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Analytics</div>
      <a href="/targets.html" class="footer-link">Targets</a>
      <a href="/usage.html" class="footer-link">Usage</a>
      <a href="/efficiency.html" class="footer-link">Efficiency</a>
      <a href="/airyards.html" class="footer-link">Air Yards</a>
      <a href="/redzone.html" class="footer-link">Red Zone</a>
      <a href="/consistency.html" class="footer-link">Consistency</a>
      <a href="/breakouts.html" class="footer-link">Breakouts</a>
      <a href="/opportunity.html" class="footer-link">Opportunity</a>
    </div>

    <div>
      <div style="font-family:var(--font-mono); font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--orange); margin-bottom:8px;">Tools</div>
      <a href="/explorer.html" class="footer-link">Stat Explorer</a>
      <a href="/compare.html" class="footer-link">Compare</a>
      <a href="/rosterbuilder.html" class="footer-link">Roster Builder</a>
      <a href="/cheatsheet.html" class="footer-link">Cheat Sheet</a>
      <a href="/auction.html" class="footer-link">Auction Values</a>
      <a href="/dashboard.html" class="footer-link">Dashboard</a>
      <a href="/prospects.html" class="footer-link">Prospects</a>
      <a href="/team/KC" class="footer-link">Teams</a>
    </div>

  </div>
  <p style="text-align:center;"><a href="/" style="color:var(--orange); text-decoration:none;">razzle.lol</a></p>
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
        if 'grid-template-columns:repeat(auto-fit, minmax(140px, 1fr))' in content:
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
