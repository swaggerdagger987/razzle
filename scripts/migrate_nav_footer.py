#!/usr/bin/env python3
"""One-off migration: replace per-page <nav class="topnav"> and
<footer class="site-footer"> blocks with <div id="site-header"> /
<div id="site-footer"> placeholders so app.js can render shared chrome.

Special cases:
  - lab.html      : keep the .lab-menu-toggle button inside the placeholder.
  - agents.html   : swap the custom .lab-header bar for the placeholder,
                    move the keyboard-controls hint into .canvas-hints,
                    and insert a <script src="app.js"> reference.
  - 404.html      : has no footer; only the nav migrates.
  - lab.html      : lab stays footerless per product spec.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"

NAV_RE = re.compile(r'<nav class="topnav"[\s\S]*?</nav>', re.MULTILINE)
FOOTER_RE = re.compile(r'<footer class="site-footer"[\s\S]*?</footer>', re.MULTILINE)

LAB_TOGGLE = (
    '<button type="button" class="lab-menu-toggle btn-chunky" '
    'aria-label="Toggle sidebar" aria-expanded="false" '
    'style="font-size:18px; padding:4px 10px; line-height:1;">&#9776;</button>'
)

NO_FOOTER = {"lab.html", "404.html", "agents.html"}
SKIP = {"reset-password.html", "verify-email.html"}

AGENTS_HEADER_RE = re.compile(
    r'<!-- Header -->\s*<div class="lab-header">[\s\S]*?</div>\s*</div>',
    re.MULTILINE,
)


def placeholder_nav(key: str, preserved_children: str = "") -> str:
    return f'<div id="site-header" data-page="{key}">{preserved_children}</div>'


def key_for(filename: str) -> str:
    if filename == "index.html":
        return "home"
    return filename[:-5]  # strip .html


def migrate_file(path: Path) -> tuple[bool, list[str]]:
    src = path.read_text(encoding="utf-8")
    orig = src
    notes: list[str] = []
    key = key_for(path.name)

    # Standard nav replacement
    if path.name == "lab.html":
        new_src, n = NAV_RE.subn(placeholder_nav(key, LAB_TOGGLE), src, count=1)
    elif path.name == "agents.html":
        # agents.html uses a custom .lab-header instead of <nav class="topnav">
        new_src, n = AGENTS_HEADER_RE.subn(placeholder_nav(key), src, count=1)
        if n:
            notes.append("replaced agents.html .lab-header with site-header placeholder")
            # Move the WASD controls hint into .canvas-hints (it's already there;
            # the lab-header version is redundant — just drop it with the header)
            # Make sure <script src="app.js"> is present before </body>
            if 'src="app.js"' not in new_src and "src='app.js'" not in new_src:
                new_src = new_src.replace(
                    "</body>",
                    '<script src="app.js" defer></script>\n</body>',
                    1,
                )
                notes.append("added app.js script tag")
    else:
        new_src, n = NAV_RE.subn(placeholder_nav(key), src, count=1)

    if n == 0 and path.name not in NO_FOOTER and path.name != "agents.html":
        notes.append("no <nav class=\"topnav\"> found")
    elif n > 0 and path.name not in ("lab.html", "agents.html"):
        notes.append(f"replaced nav ({n})")

    src = new_src

    # Footer replacement (skipped for NO_FOOTER pages)
    if path.name not in NO_FOOTER:
        new_src, fn = FOOTER_RE.subn('<div id="site-footer"></div>', src, count=1)
        if fn == 0:
            notes.append('no <footer class="site-footer"> found')
        else:
            notes.append(f"replaced footer ({fn})")
        src = new_src

    if src != orig:
        path.write_text(src, encoding="utf-8")
        return True, notes
    return False, notes


def main() -> int:
    if not FRONTEND.is_dir():
        print(f"frontend dir not found: {FRONTEND}", file=sys.stderr)
        return 2

    changed = 0
    skipped = 0
    for path in sorted(FRONTEND.glob("*.html")):
        if path.name in SKIP:
            print(f"skip   {path.name}  (no nav/footer — auth page)")
            skipped += 1
            continue
        did, notes = migrate_file(path)
        tag = "edit " if did else "noop "
        print(f"{tag}  {path.name:<28} {'; '.join(notes) if notes else ''}")
        if did:
            changed += 1

    print(f"\nchanged {changed} files, skipped {skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
