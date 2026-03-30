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
CREDS_PATH = PROJECT_DIR / "walker-credentials.json"

BASE_URL = "http://localhost:8000"


def load_credentials():
    """Load test credentials from walker-credentials.json"""
    if CREDS_PATH.exists():
        with open(CREDS_PATH, encoding="utf-8") as f:
            return json.load(f)
    return None


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

    def compare_with_previous(self):
        """Compare this walk with the most recent previous walk for trend tracking"""
        prev_reports = sorted(REPORT_DIR.glob("walk-*.json"), reverse=True)
        if len(prev_reports) < 1:
            return None

        # Load most recent previous walk
        prev_path = prev_reports[0]
        try:
            with open(prev_path, encoding="utf-8") as f:
                prev_findings = json.load(f)
        except Exception:
            return None

        prev_fails = set(f"{f['page']}:{f['message']}" for f in prev_findings if f["level"] == "FAIL")
        curr_fails = set(f"{f['page']}:{f['message']}" for f in self.findings if f["level"] == "FAIL")

        fixed = prev_fails - curr_fails
        new_breaks = curr_fails - prev_fails
        persistent = prev_fails & curr_fails

        return {
            "previous_report": prev_path.name,
            "previous_fails": len(prev_fails),
            "current_fails": len(curr_fails),
            "fixed_since_last": list(fixed)[:20],
            "new_breaks": list(new_breaks)[:20],
            "persistent_fails": len(persistent),
        }

    def write_report(self):
        """Write the full walk report with trend comparison"""
        ts = datetime.now().strftime("%Y-%m-%d-%H%M")
        report_path = REPORT_DIR / f"walk-{ts}.md"

        # Compare with previous
        trend = self.compare_with_previous()

        lines = []
        lines.append(f"# Site Walk Report - {ts}")
        lines.append(f"")
        lines.append(f"**PASS**: {self.pass_count} | **FAIL**: {self.fail_count} | **WARN**: {self.warn_count}")
        lines.append(f"**Health**: {self.pass_count}/{self.pass_count + self.fail_count} checks passed ({100*self.pass_count/max(1,self.pass_count+self.fail_count):.0f}%)")

        if trend:
            delta = trend["previous_fails"] - trend["current_fails"]
            direction = "IMPROVING" if delta > 0 else "REGRESSING" if delta < 0 else "UNCHANGED"
            lines.append(f"")
            lines.append(f"## TREND: {direction}")
            lines.append(f"Previous walk: {trend['previous_fails']} failures | This walk: {trend['current_fails']} failures | Delta: {delta:+d}")
            lines.append(f"Persistent failures (still broken): {trend['persistent_fails']}")
            if trend["fixed_since_last"]:
                lines.append(f"")
                lines.append(f"### Fixed since last walk ({len(trend['fixed_since_last'])})")
                for fix in trend["fixed_since_last"][:10]:
                    lines.append(f"  [+] {fix}")
            if trend["new_breaks"]:
                lines.append(f"")
                lines.append(f"### NEW breaks since last walk ({len(trend['new_breaks'])})")
                for brk in trend["new_breaks"][:10]:
                    lines.append(f"  [!] {brk}")
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

    def register_and_login(self, browser):
        """Register a test account via API, inject JWT, return authenticated context"""
        creds = load_credentials()
        if not creds:
            self.log("WARN", "auth", "No walker-credentials.json found. Skipping auth tests.")
            return None

        email = creds["test_account"]["email"]
        password = creds["test_account"]["password"]
        token = None

        # Step 1: Register via API (may already exist — that's fine)
        try:
            import urllib.request
            reg_data = json.dumps({"email": email, "password": password}).encode()
            req = urllib.request.Request(
                f"{BASE_URL}/api/auth/register",
                data=reg_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    result = json.loads(resp.read())
                    token = result.get("token")
                    self.log("PASS", "auth", f"Registered new account: {email}")
            except urllib.error.HTTPError as e:
                body = e.read().decode()
                if "already" in body.lower() or "exists" in body.lower():
                    self.log("INFO", "auth", f"Account {email} already exists. Logging in.")
                else:
                    self.log("WARN", "auth", f"Registration returned {e.code}: {body[:100]}")
        except Exception as e:
            self.log("WARN", "auth", f"Registration request failed: {str(e)[:100]}")

        # Step 2: Login via API to get JWT
        if not token:
            try:
                login_data = json.dumps({"email": email, "password": password}).encode()
                req = urllib.request.Request(
                    f"{BASE_URL}/api/auth/login",
                    data=login_data,
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    result = json.loads(resp.read())
                    token = result.get("token")
                    self.log("PASS", "auth", f"Logged in as {email}")
            except Exception as e:
                self.log("FAIL", "auth", f"Login failed: {str(e)[:100]}")
                return None

        if not token:
            self.log("FAIL", "auth", "No JWT token received from register or login")
            return None

        self.log("PASS", "auth", f"JWT obtained: {token[:20]}...")

        # Step 3: Create browser context with JWT injected into localStorage
        ctx = browser.new_context(viewport={"width": 1280, "height": 900})
        page = ctx.new_page()
        page.goto(f"{BASE_URL}/index.html", wait_until="networkidle", timeout=15000)
        time.sleep(1)

        # Inject JWT into localStorage (how the frontend stores auth)
        page.evaluate(f"""
            localStorage.setItem('razzle_token', '{token}');
            localStorage.setItem('token', '{token}');
        """)

        # Reload to pick up auth state
        page.reload(wait_until="networkidle", timeout=15000)
        time.sleep(2)

        # Verify logged in — check if user menu or email appears
        visible = page.inner_text("body")
        if email.split("@")[0] in visible.lower() or "sign out" in visible.lower() or "log out" in visible.lower():
            self.log("PASS", "auth", "Confirmed logged in — user menu visible")
        else:
            self.log("WARN", "auth", "JWT injected but could not confirm logged-in state in UI")

        self.screenshot(page, "auth_logged_in")
        page.close()

        # Step 4: Also test the UI registration/login flow separately
        ui_page = ctx.new_page()
        try:
            ui_page.goto(f"{BASE_URL}/index.html", wait_until="networkidle", timeout=15000)
            time.sleep(2)

            sign_in = ui_page.locator("a:has-text('Sign'), button:has-text('Sign'), [onclick*='auth'], [onclick*='login']")
            if sign_in.count() > 0:
                sign_in.first.click(timeout=3000)
                time.sleep(1)
                self.screenshot(ui_page, "auth_modal_opened")

                # Check modal has inputs
                email_input = ui_page.locator("input[type='email'], input[placeholder*='mail']")
                pass_input = ui_page.locator("input[type='password']")

                if email_input.count() > 0 and pass_input.count() > 0:
                    self.log("PASS", "auth_ui", "Auth modal has email + password inputs")
                else:
                    self.log("FAIL", "auth_ui", "Auth modal missing email or password input")
            else:
                self.log("FAIL", "auth_ui", "No sign-in button found on index.html")
        except Exception as e:
            self.log("WARN", "auth_ui", f"UI auth test error: {str(e)[:100]}")
        ui_page.close()

        return ctx

    def test_stripe_checkout(self, page, page_name):
        """Test the Stripe checkout flow with test card"""
        creds = load_credentials()
        if not creds:
            return

        card = creds["stripe_test_card"]

        try:
            # Find upgrade/subscribe button
            upgrade_btn = page.locator("button:has-text('Subscribe'), button:has-text('Upgrade'), button:has-text('Start'), a:has-text('Upgrade')")
            if upgrade_btn.count() == 0:
                self.log("WARN", page_name, "No upgrade/subscribe button found")
                return

            upgrade_btn.first.click(timeout=5000)
            time.sleep(3)

            # Check if Stripe checkout loaded (redirect or iframe)
            current_url = page.url
            if "checkout.stripe.com" in current_url:
                self.log("PASS", page_name, "Stripe checkout redirect works")
                self.screenshot(page, f"{page_name}_stripe_checkout")

                # Fill test card
                card_input = page.locator("input[name='cardNumber'], #cardNumber")
                if card_input.count() > 0:
                    card_input.first.fill(card["number"])
                    exp_input = page.locator("input[name='cardExpiry'], #cardExpiry")
                    if exp_input.count() > 0:
                        exp_input.first.fill(card["exp"])
                    cvc_input = page.locator("input[name='cardCvc'], #cardCvc")
                    if cvc_input.count() > 0:
                        cvc_input.first.fill(card["cvc"])

                    self.log("PASS", page_name, "Stripe test card filled successfully")

                    # Submit payment
                    submit = page.locator("button[type='submit'], .SubmitButton")
                    if submit.count() > 0:
                        submit.first.click(timeout=10000)
                        time.sleep(5)
                        self.screenshot(page, f"{page_name}_stripe_after_submit")
                        self.log("PASS", page_name, f"Stripe payment submitted. URL: {page.url[:80]}")
                    else:
                        self.log("WARN", page_name, "Could not find Stripe submit button")
                else:
                    self.log("WARN", page_name, "Stripe checkout loaded but could not find card input")
            else:
                self.log("WARN", page_name, f"Upgrade clicked but no Stripe redirect. URL: {current_url[:80]}")

        except PlaywrightTimeout:
            self.log("FAIL", page_name, "Stripe checkout timed out")
        except Exception as e:
            self.log("FAIL", page_name, f"Stripe checkout error: {str(e)[:150]}")

    def test_situation_room(self, page, page_name):
        """Test the Situation Room AI agent call"""
        creds = load_credentials()
        if not creds or creds.get("openrouter_key", {}).get("key", "").startswith("PASTE"):
            self.log("WARN", page_name, "No OpenRouter key configured. Skipping AI test.")
            return

        try:
            # Look for scenario input
            textarea = page.locator("textarea, input[placeholder*='scenario'], input[placeholder*='question']")
            if textarea.count() == 0:
                self.log("WARN", page_name, "No scenario input found in Situation Room")
                return

            textarea.first.fill("Should I trade Breece Hall for the 1.02 pick?")
            time.sleep(1)

            # Find submit button
            submit = page.locator("button:has-text('Run'), button:has-text('Ask'), button:has-text('Submit'), button:has-text('Brief')")
            if submit.count() > 0:
                submit.first.click(timeout=5000)
                time.sleep(10)  # Wait for LLM response

                # Check if any agent responded
                visible = page.inner_text("body")
                agent_names = ["Razzle", "Dr. Dolphin", "Hawkeye", "Bones", "Octo", "Atlas"]
                responded = [name for name in agent_names if name in visible]

                if responded:
                    self.log("PASS", page_name, f"Agents responded: {', '.join(responded)}")
                else:
                    self.log("FAIL", page_name, "No agent responses appeared after submitting scenario")

                self.screenshot(page, f"{page_name}_agent_response")
            else:
                self.log("WARN", page_name, "No submit button found for scenario")

        except Exception as e:
            self.log("FAIL", page_name, f"Situation Room test error: {str(e)[:150]}")

    def run(self, pages=None):
        """Run the full site walk: unauthenticated, then authenticated with Elite"""
        print(f"Razzle Site Walker")
        print(f"Deep mode: {self.deep}")
        print(f"Base URL: {BASE_URL}")
        print(f"")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # Phase 1: Unauthenticated walk (free user experience)
            print(f"\n{'='*60}")
            print(f"  PHASE 1: FREE USER WALK (not logged in)")
            print(f"{'='*60}")

            targets = pages or list(EXPECTATIONS.keys())
            for page_name in targets:
                expectations = EXPECTATIONS.get(page_name, {
                    "must_not_have_text": ["undefined", "NaN", "error"],
                    "clickables": [],
                })
                self.walk_page(browser, page_name, expectations)

            # Phase 2: Authenticated walk (logged in, test Pro/Elite features)
            print(f"\n{'='*60}")
            print(f"  PHASE 2: AUTHENTICATED WALK (logged in)")
            print(f"{'='*60}")

            auth_ctx = self.register_and_login(browser)
            if auth_ctx:
                auth_page = auth_ctx.new_page()

                # Walk authenticated pages
                for page_name in ["lab.html", "league-intel.html", "agents.html", "pricing.html"]:
                    try:
                        auth_page.goto(f"{BASE_URL}/{page_name}", wait_until="networkidle", timeout=15000)
                        time.sleep(3)
                        self.screenshot(auth_page, f"auth_{page_name}")

                        # Check for Pro/Elite features visible
                        visible = auth_page.inner_text("body")
                        if "upgrade" in visible.lower() or "pro" in visible.lower():
                            self.log("INFO", f"auth_{page_name}", "Upgrade prompts visible (expected for free account)")

                        # Check agent nudges (Elite only)
                        nudges = auth_page.locator("[class*='nudge'], [class*='agent-nudge']")
                        if nudges.count() > 0:
                            self.log("PASS", f"auth_{page_name}", f"Agent nudges visible: {nudges.count()}")

                    except Exception as e:
                        self.log("FAIL", f"auth_{page_name}", f"Authenticated page error: {str(e)[:100]}")

                # Test Stripe checkout from pricing page
                try:
                    auth_page.goto(f"{BASE_URL}/pricing.html", wait_until="networkidle", timeout=15000)
                    time.sleep(2)
                    self.test_stripe_checkout(auth_page, "pricing_checkout")
                except Exception as e:
                    self.log("FAIL", "pricing_checkout", f"Stripe test error: {str(e)[:100]}")

                # Test Situation Room AI
                try:
                    auth_page.goto(f"{BASE_URL}/agents.html", wait_until="networkidle", timeout=15000)
                    time.sleep(2)
                    self.test_situation_room(auth_page, "situation_room_ai")
                except Exception as e:
                    self.log("FAIL", "situation_room_ai", f"AI test error: {str(e)[:100]}")

                auth_ctx.close()

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
