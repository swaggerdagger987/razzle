"""Single bridge to legacy/backend — the only module allowed to manipulate sys.path.

Every service that needs legacy live_data, auth, billing, or agent_facts imports
from here. When legacy is fully ported, delete this file and the legacy/ tree.
"""

from __future__ import annotations

import importlib
import sys
from functools import lru_cache
from pathlib import Path

_LEGACY_ROOT = Path(__file__).resolve().parents[2] / "legacy"

if str(_LEGACY_ROOT) not in sys.path:
    sys.path.insert(0, str(_LEGACY_ROOT))


@lru_cache(maxsize=1)
def live_data():
    return importlib.import_module("backend.live_data")


@lru_cache(maxsize=1)
def auth():
    return importlib.import_module("backend.auth")


@lru_cache(maxsize=1)
def billing():
    return importlib.import_module("backend.billing")


@lru_cache(maxsize=1)
def agent_facts():
    return importlib.import_module("backend.agent_facts")
