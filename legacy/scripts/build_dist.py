"""Build frontend/dist/ with bundled + minified JS and CSS.

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

# ---------------------------------------------------------------------------
# JS Bundles — group files loaded together to reduce HTTP requests.
# Order within each bundle matters (dependencies first).
# ---------------------------------------------------------------------------
BUNDLES = {
    # Lab page bundle: lab.js + its deferred deps
    "lab-bundle.js": [
        "lab.js",
        "formulas.js",
        "formula-store.js",
        "charts.js",
        "lab-panels.js",
    ],
    # Situation Room bundle
    "warroom-bundle.js": [
        "agent-config.js",
        "warroom.js",
    ],
    # Agent helpers (used by lab + league-intel)
    "agent-helpers-bundle.js": [
        "agent-config.js",
        "agent-nudges.js",
    ],
}

# Files in bundles — don't also emit them individually
_BUNDLED_FILES = set()
for _files in BUNDLES.values():
    _BUNDLED_FILES.update(_files)


def build():
    # Clean and recreate dist/
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    js_count = css_count = html_count = bundle_count = 0
    saved = 0

    # --- Create bundles first ---
    for bundle_name, sources in BUNDLES.items():
        parts = []
        raw_total = 0
        for src_name in sources:
            src_file = SRC / src_name
            if src_file.exists():
                raw = src_file.read_text(encoding="utf-8")
                raw_total += len(raw)
                parts.append(f"/* === {src_name} === */")
                parts.append(raw)
        if parts:
            combined = "\n".join(parts)
            minified = rjsmin.jsmin(combined)
            (DIST / bundle_name).write_text(minified, encoding="utf-8")
            saved += raw_total - len(minified)
            bundle_count += 1
            print(f"  Bundle {bundle_name}: {len(sources)} files, {raw_total:,} -> {len(minified):,} bytes")

    # --- Minify remaining JS (not in any bundle) ---
    for f in sorted(SRC.glob("*.js")):
        if f.name in _BUNDLED_FILES:
            continue
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

    print(f"Build complete: {bundle_count} bundles, {js_count} JS, {css_count} CSS, {html_count} HTML")
    print(f"Saved {saved:,} bytes ({saved / 1024:.0f} KB) from bundling + minification")


if __name__ == "__main__":
    build()
