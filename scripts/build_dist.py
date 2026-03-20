"""Build frontend/dist/ with minified JS and CSS.

Uses rjsmin (JS) and rcssmin (CSS) — pure Python, no Node.js required.
Called during Render build step. The server serves from frontend/dist/
when it exists, otherwise falls back to frontend/ for local dev.
"""
import os
import shutil
from pathlib import Path

import rjsmin
import rcssmin

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "frontend"
DIST = ROOT / "frontend" / "dist"


def build():
    # Clean and recreate dist/
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    js_count = css_count = html_count = 0
    saved = 0

    # Minify JS
    for f in sorted(SRC.glob("*.js")):
        raw = f.read_text(encoding="utf-8")
        minified = rjsmin.jsmin(raw)
        (DIST / f.name).write_text(minified, encoding="utf-8")
        saved += len(raw) - len(minified)
        js_count += 1

    # Minify CSS
    for f in sorted(SRC.glob("*.css")):
        raw = f.read_text(encoding="utf-8")
        minified = rcssmin.cssmin(raw)
        (DIST / f.name).write_text(minified, encoding="utf-8")
        saved += len(raw) - len(minified)
        css_count += 1

    # Copy HTML
    for f in sorted(SRC.glob("*.html")):
        shutil.copy2(f, DIST / f.name)
        html_count += 1

    # Copy assets/ and favicon
    assets_src = SRC / "assets"
    if assets_src.exists():
        shutil.copytree(assets_src, DIST / "assets")

    favicon = SRC / "favicon.svg"
    if favicon.exists():
        shutil.copy2(favicon, DIST / "favicon.svg")

    print(f"Build complete: {js_count} JS, {css_count} CSS, {html_count} HTML")
    print(f"Saved {saved:,} bytes ({saved / 1024:.0f} KB) from minification")


if __name__ == "__main__":
    build()
