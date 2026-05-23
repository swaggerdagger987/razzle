"""Shared utilities for data adapters."""

import re


def normalize_name(name):
    """Normalize name for matching: lowercase, strip suffixes, alpha only."""
    if not name:
        return ""
    name = name.lower().strip()
    name = re.sub(r"\s+(jr|sr|ii|iii|iv|v)\.?$", "", name)
    name = re.sub(r"[^a-z]", "", name)
    return name
