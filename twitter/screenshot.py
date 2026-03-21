#!/usr/bin/env python3
"""
Razzle Lab Screenshot Tool

Takes screenshots of the Lab screener for use in tweets.
Captures player data views, filtered panels, and comparison cards.

Usage:
    python screenshot.py                           # Random interesting screener view
    python screenshot.py --position QB             # QB screener
    python screenshot.py --position RB --sort ppg  # RBs sorted by PPG
    python screenshot.py --panel breakouts         # Breakout finder panel
    python screenshot.py --batch 20                # Generate 20 varied screenshots
"""

import argparse
import random
import time
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright

SCRIPT_DIR = Path(__file__).resolve().parent
SCREENSHOT_DIR = SCRIPT_DIR / "screenshots"
SCREENSHOT_DIR.mkdir(exist_ok=True)

BASE_URL = "http://localhost:8000"
LIVE_URL = "https://razzle.lol"

POSITIONS = ["QB", "RB", "WR", "TE"]
SORT_COLS = [
    "fantasy_points_ppr", "ppg", "target_share", "targets", "receptions",
    "receiving_yards", "rushing_yards", "passing_yards", "wopr",
    "yards_per_carry", "yards_per_rec", "catch_rate", "passing_tds",
    "rushing_tds", "receiving_tds", "carries", "snap_pct"
]
PANELS = [
    "breakouts", "efficiency", "usage-trends", "trade-values",
    "aging-curves", "consistency", "dual-threat", "target-distribution",
    "workload", "red-zone", "dynasty-rankings"
]


def take_screener_screenshot(page, position=None, sort_col=None, output_name=None):
    """Navigate to Lab screener with filters and take screenshot."""
    url = f"{BASE_URL}/lab.html"
    params = []
    if position:
        params.append(f"pos={position}")
    if sort_col:
        params.append(f"sort={sort_col}")
        params.append("dir=desc")
    if params:
        url += "?" + "&".join(params)

    page.goto(url, wait_until="networkidle", timeout=15000)
    time.sleep(2)  # Let data render

    # Hide any modals/overlays
    page.evaluate("""
        document.querySelectorAll('.modal, .overlay, .welcome-modal').forEach(el => el.style.display = 'none');
    """)
    time.sleep(0.5)

    # Determine output filename
    if not output_name:
        pos_tag = position.lower() if position else "all"
        sort_tag = sort_col if sort_col else "default"
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_name = f"lab_{pos_tag}_{sort_tag}_{ts}"

    filepath = SCREENSHOT_DIR / f"{output_name}.png"

    # Screenshot the main content area (not the full page)
    # Try to find the screener table
    screener = page.query_selector(".screener-container, .lab-content, main, #screener-table")
    if screener:
        screener.screenshot(path=str(filepath))
    else:
        page.screenshot(path=str(filepath), full_page=False)

    print(f"  Screenshot saved: {filepath.name}")
    return filepath


def take_panel_screenshot(page, panel_name, output_name=None):
    """Navigate to a Lab panel and take screenshot."""
    url = f"{BASE_URL}/lab.html?panel={panel_name}"
    page.goto(url, wait_until="networkidle", timeout=15000)
    time.sleep(2)

    page.evaluate("""
        document.querySelectorAll('.modal, .overlay, .welcome-modal').forEach(el => el.style.display = 'none');
    """)
    time.sleep(0.5)

    if not output_name:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_name = f"panel_{panel_name}_{ts}"

    filepath = SCREENSHOT_DIR / f"{output_name}.png"

    panel = page.query_selector(".panel-content, .lab-panel, main")
    if panel:
        panel.screenshot(path=str(filepath))
    else:
        page.screenshot(path=str(filepath), full_page=False)

    print(f"  Screenshot saved: {filepath.name}")
    return filepath


def generate_batch(count=20):
    """Generate a batch of varied screenshots for tweet content."""
    screenshots = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()

        # Mix of screener views and panels
        for i in range(count):
            try:
                if random.random() < 0.6:
                    # Screener view
                    pos = random.choice(POSITIONS)
                    sort = random.choice(SORT_COLS)
                    filepath = take_screener_screenshot(page, position=pos, sort_col=sort)
                else:
                    # Panel view
                    panel = random.choice(PANELS)
                    filepath = take_panel_screenshot(page, panel)
                screenshots.append(filepath)
            except Exception as e:
                print(f"  Error on screenshot {i+1}: {e}")

        browser.close()

    print(f"\nGenerated {len(screenshots)} screenshots in {SCREENSHOT_DIR}")
    return screenshots


def main():
    global BASE_URL

    parser = argparse.ArgumentParser(description="Razzle Lab Screenshot Tool")
    parser.add_argument("--position", type=str, choices=POSITIONS, help="Filter by position")
    parser.add_argument("--sort", type=str, help="Sort column")
    parser.add_argument("--panel", type=str, help="Panel name to screenshot")
    parser.add_argument("--batch", type=int, help="Generate N varied screenshots")
    parser.add_argument("--url", type=str, default=BASE_URL, help="Base URL (default: localhost)")

    args = parser.parse_args()

    if args.url and args.url != BASE_URL:
        BASE_URL = args.url

    if args.batch:
        generate_batch(args.batch)
    elif args.panel:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            take_panel_screenshot(page, args.panel)
            browser.close()
    else:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            take_screener_screenshot(page, position=args.position, sort_col=args.sort)
            browser.close()


if __name__ == "__main__":
    main()
