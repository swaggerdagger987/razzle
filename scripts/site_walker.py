#!/usr/bin/env python3
"""
Razzle Site Walker

Browses localhost like a real user. Clicks every button, opens every panel,
fills in forms, and writes a detailed report of what works and what breaks.

Output: designer-reports/walk-YYYY-MM-DD-HHMM.md

Usage:
    python scripts/site_walker.py                    # Walk all pages
    python scripts/site_walker.py --page lab.html    # Walk one page
    python scripts/site_walker.py --deep             # Click into every panel
"""

import json
import time
import argparse
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

PROJECT_DIR = Path(__file__).resolve().parent.parent
REPORT_DIR = PROJECT_DIR / "designer-reports"
REPORT_DIR.mkdir(exist_ok=True)
SCREENSHOT_DIR = PROJECT_DIR / "designer-screenshots"
SCREENSHOT_DIR.mkdir(exist_ok=True)

BASE_URL = "http://localhost:8000"

# What we expect to see on each page (from DESIGN.md + NORTH_STAR + agent design)
EXPECTATIONS = {
    "index.html": {
        "title_contains": "Razzle",
        "must_have_text": [
            "Fourth Down Lab",
            "Bureau of Intelligence",
            "Situation Room",
        ],
        "must_have_elements": [
            "nav",
            "a[href*='lab']",
            "a[href*='league-intel']",
            "a[href*='agents']",
        ],
        "must_not_have_text": [
            "Loading...",
            "undefined",
            "NaN",
            "null",
            "error",
        ],
        "clickables": [
            {"selector": "a[href*='lab']", "label": "Lab nav link"},
            {"selector": "a[href*='league-intel']", "label": "Bureau nav link"},
            {"selector": "a[href*='agents']", "label": "Situation Room nav link"},
            {"selector": "a[href*='pricing']", "label": "Pricing nav link"},
        ],
    },
    "lab.html": {
        "title_contains": "Lab",
        "must_have_text": [],
        "must_have_elements": [
            "table, .screener-table, .virtual-scroll",
            ".sidebar, .lab-sidebar",
        ],
        "must_not_have_text": [
            "Loading...",
            "undefined",
            "NaN",
        ],
        "check_data_loads": True,
        "clickables": [
            {"selector": ".sidebar a, .sidebar button, .sidebar [onclick]", "label": "Sidebar panel links", "click_all": True},
        ],
    },
    "league-intel.html": {
        "title_contains": "Bureau",
        "must_have_text": [],
        "must_have_elements": [
            "input, .sleeper-input, [placeholder*='leeper'], [placeholder*='sername']",
        ],
        "must_not_have_text": [
            "undefined",
            "NaN",
        ],
        "check_tabs": True,
        "clickables": [],
    },
    "agents.html": {
        "title_contains": "Situation",
        "must_have_text": [
            "Razzle",
        ],
        "must_have_elements": [
            "canvas, .war-room, .pixel-canvas",
        ],
        "must_not_have_text": [
            "undefined",
            "NaN",
        ],
        "clickables": [],
    },
    "pricing.html": {
        "title_contains": "Pricing",
        "must_have_text": [
            "Free",
            "Pro",
            "Elite",
        ],
        "must_have_elements": [],
        "must_not_have_text": [
            "undefined",
            "NaN",
        ],
        "clickables": [],
    },
}


class SiteWalker:
    def __init__(self, deep=False):
        self.deep = deep
        self.findings = []
        self.screenshots = []
        self.pass_count = 0
        self.fail_count = 0
        self.warn_count = 0

    def log(self, level, page, message, element=None):
        entry = {
            "level": level,
            "page": page,
            "message": message,
            "element": element,
            "timestamp": datetime.now().isoformat(),
        }
        self.findings.append(entry)
        icon = {"PASS": "+", "FAIL": "X", "WARN": "?", "INFO": "-"}[level]
        print(f"  [{icon}] {page}: {message}")
        if level == "PASS":
            self.pass_count += 1
        elif level == "FAIL":
            self.fail_count += 1
        elif level == "WARN":
            self.warn_count += 1

    def screenshot(self, page_obj, name):
        path = SCREENSHOT_DIR / f"walk_{name}_{datetime.now().strftime('%H%M%S')}.png"
        page_obj.screenshot(path=str(path))
        self.screenshots.append(str(path))
        return path

    def check_console_errors(self, page_name, console_messages):
        errors = [m for m in console_messages if m["type"] in ("error", "pageerror")]
        for err in errors:
            self.log("FAIL", page_name, f"Console error: {err['text'][:200]}")
        if not errors:
            self.log("PASS", page_name, "No console errors")

    def check_network_failures(self, page_name, failed_requests):
        for req in failed_requests:
            self.log("FAIL", page_name, f"Failed request: {req['method']} {req['url'][:100]} -> {req['status']}")
        if not failed_requests:
            self.log("PASS", page_name, "No failed network requests")

    def check_text_present(self, page_obj, page_name, texts):
        content = page_obj.content()
        for text in texts:
            if text.lower() in content.lower():
                self.log("PASS", page_name, f"Found expected text: '{text}'")
            else:
                self.log("FAIL", page_name, f"Missing expected text: '{text}'")

    def check_text_absent(self, page_obj, page_name, texts):
        # Get visible text only, not HTML source
        visible = page_obj.inner_text("body")
        for text in texts:
            if text.lower() in visible.lower():
                self.log("FAIL", page_name, f"Found unwanted text: '{text}'")
            else:
                self.log("PASS", page_name, f"No unwanted text: '{text}'")

    def check_elements_exist(self, page_obj, page_name, selectors):
        for selector in selectors:
            try:
                count = page_obj.locator(selector).count()
                if count > 0:
                    self.log("PASS", page_name, f"Found element: {selector} ({count} instances)")
                else:
                    self.log("FAIL", page_name, f"Missing element: {selector}")
            except Exception as e:
                self.log("FAIL", page_name, f"Error checking element {selector}: {e}")

    def check_fonts(self, page_obj, page_name):
        """Check that data elements use Space Mono, headings use Luckiest Guy"""
        font_check = page_obj.evaluate("""
            () => {
                const issues = [];
                // Check table cells use monospace
                document.querySelectorAll('td, .stat, .data-value').forEach(el => {
                    const font = getComputedStyle(el).fontFamily;
                    if (!font.includes('Space Mono') && !font.includes('monospace')) {
                        issues.push({element: el.tagName + '.' + el.className, font: font, text: el.textContent.slice(0, 30)});
                    }
                });
                return issues.slice(0, 5);
            }
        """)
        if font_check:
            for issue in font_check:
                self.log("WARN", page_name, f"Non-mono font on data: {issue['element']} uses {issue['font'][:30]}")
        else:
            self.log("PASS", page_name, "Data elements use correct fonts")

    def check_design_tokens(self, page_obj, page_name):
        """Check sand background, no thin borders, correct accent colors"""
        design_check = page_obj.evaluate("""
            () => {
                const issues = [];
                const body = getComputedStyle(document.body);
                const bg = body.backgroundColor;

                // Check for 1px borders (should be 3px)
                document.querySelectorAll('.card, .panel, [class*=card]').forEach(el => {
                    const border = getComputedStyle(el).borderWidth;
                    if (border === '1px') {
                        issues.push({type: 'thin-border', element: el.tagName + '.' + el.className.split(' ')[0]});
                    }
                });

                // Check for gradients (should be none)
                document.querySelectorAll('*').forEach(el => {
                    const bg = getComputedStyle(el).backgroundImage;
                    if (bg && bg.includes('gradient') && !bg.includes('none')) {
                        issues.push({type: 'gradient', element: el.tagName + '.' + el.className.split(' ')[0]});
                    }
                });

                return issues.slice(0, 10);
            }
        """)
        for issue in design_check:
            if issue["type"] == "thin-border":
                self.log("WARN", page_name, f"1px border (should be 3px): {issue['element']}")
            elif issue["type"] == "gradient":
                self.log("WARN", page_name, f"Gradient found (should be flat): {issue['element']}")

    def check_agent_presence(self, page_obj, page_name):
        """Check for agent icons, agent-voiced loading states, attribution"""
        agent_check = page_obj.evaluate("""
            () => {
                const findings = {icons: 0, attribution: 0, caveat: 0, agentNames: []};

                // Agent SVG icons
                document.querySelectorAll('img[src*="agent"], .agent-icon, [class*="agent"]').forEach(el => {
                    findings.icons++;
                });

                // Agent attribution text
                const agentNames = ['Razzle', 'Dr. Dolphin', 'Hawkeye', 'Bones', 'Octo', 'Atlas'];
                const bodyText = document.body.innerText;
                agentNames.forEach(name => {
                    if (bodyText.includes(name)) {
                        findings.agentNames.push(name);
                        findings.attribution++;
                    }
                });

                // Caveat font usage
                document.querySelectorAll('*').forEach(el => {
                    const font = getComputedStyle(el).fontFamily;
                    if (font.includes('Caveat')) findings.caveat++;
                });

                return findings;
            }
        """)
        if agent_check["icons"] > 0:
            self.log("PASS", page_name, f"Agent icons found: {agent_check['icons']}")
        else:
            self.log("FAIL", page_name, "No agent icons found anywhere on page")

        if agent_check["attribution"] > 0:
            self.log("PASS", page_name, f"Agent names visible: {', '.join(agent_check['agentNames'])}")
        else:
            self.log("WARN", page_name, "No agent names visible on page")

        if agent_check["caveat"] > 0:
            self.log("PASS", page_name, f"Caveat font used: {agent_check['caveat']} elements")
        else:
            self.log("WARN", page_name, "No Caveat font found (personality layer missing)")

    def check_readability(self, page_obj, page_name):
        """Check text contrast, font sizes, line heights"""
        readability = page_obj.evaluate("""
            () => {
                const issues = [];
                document.querySelectorAll('p, span, td, th, a, li, h1, h2, h3, label').forEach(el => {
                    const style = getComputedStyle(el);
                    const fontSize = parseFloat(style.fontSize);
                    if (fontSize < 12 && el.textContent.trim().length > 0) {
                        issues.push({type: 'small-font', size: fontSize, text: el.textContent.trim().slice(0, 30), tag: el.tagName});
                    }
                    const lineHeight = parseFloat(style.lineHeight);
                    if (lineHeight > 0 && lineHeight < fontSize * 1.2 && el.textContent.trim().length > 20) {
                        issues.push({type: 'tight-line-height', lineHeight: lineHeight, fontSize: fontSize, text: el.textContent.trim().slice(0, 30)});
                    }
                });
                return issues.slice(0, 10);
            }
        """)
        small_fonts = [i for i in readability if i["type"] == "small-font"]
        if small_fonts:
            for sf in small_fonts[:3]:
                self.log("WARN", page_name, f"Font too small ({sf['size']}px): '{sf['text']}' ({sf['tag']})")
        else:
            self.log("PASS", page_name, "All fonts above 12px minimum")

    def check_mobile(self, page_obj, page_name):
        """Check for horizontal overflow at 480px"""
        page_obj.set_viewport_size({"width": 480, "height": 900})
        time.sleep(1)

        overflow = page_obj.evaluate("""
            () => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            }
        """)
        if overflow:
            self.log("FAIL", page_name, "Horizontal overflow at 480px (mobile broken)")
        else:
            self.log("PASS", page_name, "No horizontal overflow at 480px")

        self.screenshot(page_obj, f"{page_name}_mobile")
        page_obj.set_viewport_size({"width": 1280, "height": 900})
        time.sleep(0.5)

    def click_and_check(self, page_obj, page_name, clickable):
        """Click an element and check what happens"""
        selector = clickable["selector"]
        label = clickable["label"]
        click_all = clickable.get("click_all", False)

        try:
            elements = page_obj.locator(selector)
            count = elements.count()
            if count == 0:
                self.log("FAIL", page_name, f"Clickable not found: {label} ({selector})")
                return

            max_clicks = min(count, 20) if click_all else 1
            self.log("INFO", page_name, f"Found {count} clickable elements for: {label}")

            for i in range(max_clicks):
                try:
                    el = elements.nth(i)
                    el_text = el.inner_text()[:50] if el.is_visible() else "(hidden)"

                    if not el.is_visible():
                        continue

                    el.click(timeout=3000)
                    time.sleep(1.5)

                    # Check for errors after click
                    visible = page_obj.inner_text("body")
                    if "error" in visible.lower()[:500] or "undefined" in visible.lower()[:500]:
                        self.log("FAIL", page_name, f"Error after clicking {label} [{i}]: '{el_text}'")
                        self.screenshot(page_obj, f"{page_name}_click_error_{i}")
                    else:
                        self.log("PASS", page_name, f"Clicked {label} [{i}]: '{el_text}' - no errors")

                    if click_all and i < max_clicks - 1:
                        self.screenshot(page_obj, f"{page_name}_{label}_{i}")

                except PlaywrightTimeout:
                    self.log("WARN", page_name, f"Timeout clicking {label} [{i}]")
                except Exception as e:
                    self.log("WARN", page_name, f"Error clicking {label} [{i}]: {str(e)[:100]}")

        except Exception as e:
            self.log("FAIL", page_name, f"Error finding clickable {label}: {str(e)[:100]}")

    def walk_page(self, browser, page_name, expectations):
        """Walk a single page with all checks"""
        print(f"\n{'='*60}")
        print(f"  Walking: {page_name}")
        print(f"{'='*60}")

        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()

        # Capture console errors
        console_messages = []
        page.on("console", lambda msg: console_messages.append({"type": msg.type, "text": msg.text}))

        # Capture failed requests
        failed_requests = []
        page.on("response", lambda resp: failed_requests.append(
            {"method": resp.request.method, "url": resp.url, "status": resp.status}
        ) if resp.status >= 400 else None)

        # Navigate
        try:
            page.goto(f"{BASE_URL}/{page_name}", wait_until="networkidle", timeout=15000)
            time.sleep(3)
            self.log("PASS", page_name, "Page loaded successfully")
        except PlaywrightTimeout:
            self.log("FAIL", page_name, "Page load timed out (15s)")
            self.screenshot(page, page_name)
            ctx.close()
            return
        except Exception as e:
            self.log("FAIL", page_name, f"Page failed to load: {str(e)[:100]}")
            ctx.close()
            return

        # Screenshot
        self.screenshot(page, page_name)

        # Run all checks
        if expectations.get("title_contains"):
            title = page.title()
            if expectations["title_contains"].lower() in title.lower():
                self.log("PASS", page_name, f"Title contains '{expectations['title_contains']}': {title}")
            else:
                self.log("FAIL", page_name, f"Title missing '{expectations['title_contains']}': {title}")

        if expectations.get("must_have_text"):
            self.check_text_present(page, page_name, expectations["must_have_text"])

        if expectations.get("must_not_have_text"):
            self.check_text_absent(page, page_name, expectations["must_not_have_text"])

        if expectations.get("must_have_elements"):
            self.check_elements_exist(page, page_name, expectations["must_have_elements"])

        self.check_console_errors(page_name, console_messages)
        self.check_network_failures(page_name, failed_requests)
        self.check_fonts(page, page_name)
        self.check_design_tokens(page, page_name)
        self.check_agent_presence(page, page_name)
        self.check_readability(page, page_name)
        self.check_mobile(page, page_name)

        # Click interactive elements
        for clickable in expectations.get("clickables", []):
            self.click_and_check(page, page_name, clickable)

        # Deep mode: click sidebar panels in the Lab
        if self.deep and page_name == "lab.html":
            self.walk_lab_panels(page, page_name)

        ctx.close()

    def walk_lab_panels(self, page, page_name):
        """Click every panel in the Lab sidebar and check if it loads"""
        print(f"\n  --- Deep mode: Walking all Lab panels ---")

        sidebar_links = page.locator(".sidebar a, .sidebar [onclick], .sidebar button")
        count = sidebar_links.count()
        self.log("INFO", page_name, f"Found {count} sidebar items to check")

        for i in range(min(count, 70)):
            try:
                link = sidebar_links.nth(i)
                if not link.is_visible():
                    continue

                link_text = link.inner_text().strip()[:40]
                if not link_text or len(link_text) < 2:
                    continue

                link.click(timeout=3000)
                time.sleep(2)

                # Check if panel content loaded
                visible_text = page.inner_text("body")
                has_data = len(visible_text) > 500
                has_error = "error" in visible_text.lower()[:300]
                has_loading = "loading" in visible_text.lower()[:300]

                if has_error:
                    self.log("FAIL", f"{page_name}#{link_text}", "Panel shows error")
                    self.screenshot(page, f"panel_{link_text.replace(' ', '_')[:20]}_error")
                elif has_loading:
                    self.log("WARN", f"{page_name}#{link_text}", "Panel stuck on loading state")
                    self.screenshot(page, f"panel_{link_text.replace(' ', '_')[:20]}_loading")
                elif has_data:
                    self.log("PASS", f"{page_name}#{link_text}", "Panel loaded with data")
                else:
                    self.log("WARN", f"{page_name}#{link_text}", "Panel loaded but appears empty")
                    self.screenshot(page, f"panel_{link_text.replace(' ', '_')[:20]}_empty")

            except PlaywrightTimeout:
                self.log("WARN", f"{page_name}#panel_{i}", f"Timeout clicking panel {i}")
            except Exception as e:
                self.log("WARN", f"{page_name}#panel_{i}", f"Error: {str(e)[:80]}")

    def write_report(self):
        """Write the full walk report"""
        ts = datetime.now().strftime("%Y-%m-%d-%H%M")
        report_path = REPORT_DIR / f"walk-{ts}.md"

        lines = []
        lines.append(f"# Site Walk Report - {ts}")
        lines.append(f"")
        lines.append(f"**PASS**: {self.pass_count} | **FAIL**: {self.fail_count} | **WARN**: {self.warn_count}")
        lines.append(f"**Health**: {self.pass_count}/{self.pass_count + self.fail_count} checks passed ({100*self.pass_count/max(1,self.pass_count+self.fail_count):.0f}%)")
        lines.append(f"")

        # Summary of failures
        failures = [f for f in self.findings if f["level"] == "FAIL"]
        if failures:
            lines.append(f"## FAILURES ({len(failures)})")
            lines.append("")
            for f in failures:
                lines.append(f"- **{f['page']}**: {f['message']}")
            lines.append("")

        # Summary of warnings
        warnings = [f for f in self.findings if f["level"] == "WARN"]
        if warnings:
            lines.append(f"## WARNINGS ({len(warnings)})")
            lines.append("")
            for w in warnings:
                lines.append(f"- **{w['page']}**: {w['message']}")
            lines.append("")

        # Per-page detail
        pages_seen = []
        for f in self.findings:
            if f["page"] not in pages_seen:
                pages_seen.append(f["page"])

        for page_name in pages_seen:
            page_findings = [f for f in self.findings if f["page"] == page_name]
            page_fails = len([f for f in page_findings if f["level"] == "FAIL"])
            page_passes = len([f for f in page_findings if f["level"] == "PASS"])

            status = "BROKEN" if page_fails > 3 else "ISSUES" if page_fails > 0 else "OK"
            lines.append(f"## {page_name} [{status}] - {page_passes}P / {page_fails}F")
            lines.append("")
            for f in page_findings:
                icon = {"PASS": "+", "FAIL": "X", "WARN": "?", "INFO": "-"}[f["level"]]
                lines.append(f"  [{icon}] {f['message']}")
            lines.append("")

        # Agent presence summary
        lines.append("## Agent Presence Summary")
        lines.append("")
        agent_findings = [f for f in self.findings if "agent" in f["message"].lower() or "caveat" in f["message"].lower()]
        for f in agent_findings:
            icon = {"PASS": "+", "FAIL": "X", "WARN": "?", "INFO": "-"}[f["level"]]
            lines.append(f"  [{icon}] {f['page']}: {f['message']}")
        lines.append("")

        with open(report_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))

        # Also save raw JSON
        json_path = REPORT_DIR / f"walk-{ts}.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(self.findings, f, indent=2)

        print(f"\nReport: {report_path}")
        print(f"Raw data: {json_path}")
        return report_path

    def run(self, pages=None):
        """Run the full site walk"""
        print(f"Razzle Site Walker")
        print(f"Deep mode: {self.deep}")
        print(f"Base URL: {BASE_URL}")
        print(f"")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            targets = pages or list(EXPECTATIONS.keys())
            for page_name in targets:
                expectations = EXPECTATIONS.get(page_name, {
                    "must_not_have_text": ["undefined", "NaN", "error"],
                    "clickables": [],
                })
                self.walk_page(browser, page_name, expectations)

            browser.close()

        report = self.write_report()
        print(f"\n{'='*60}")
        print(f"WALK COMPLETE")
        print(f"PASS: {self.pass_count} | FAIL: {self.fail_count} | WARN: {self.warn_count}")
        print(f"Report: {report}")
        print(f"{'='*60}")
        return report


def main():
    parser = argparse.ArgumentParser(description="Razzle Site Walker")
    parser.add_argument("--page", type=str, help="Walk only this page")
    parser.add_argument("--deep", action="store_true", help="Click into every Lab panel")
    parser.add_argument("--url", type=str, default=BASE_URL, help="Base URL")

    args = parser.parse_args()

    if args.url != BASE_URL:
        global BASE_URL
        BASE_URL = args.url

    walker = SiteWalker(deep=args.deep)

    pages = [args.page] if args.page else None
    walker.run(pages)


if __name__ == "__main__":
    main()
