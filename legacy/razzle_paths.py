"""Shared paths for legacy adapters and live_data — one terminal.db location."""

from __future__ import annotations

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

if os.environ.get("ENVIRONMENT") == "production":
    DATA_DIR = Path("/data")
else:
    DATA_DIR = Path(os.environ.get("RAZZLE_DATA_DIR", str(REPO_ROOT / "data")))

TERMINAL_DB = DATA_DIR / "terminal.db"
CLEAN_DB = DATA_DIR / "terminal_clean.db"
