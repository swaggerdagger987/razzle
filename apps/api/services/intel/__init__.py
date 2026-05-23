"""Razzle Intel — contextual fact snippets (coaching tendencies, contracts, usage).

Simple problem, insane data. Sync first, optimize later.
See docs/v2/INTEL.md
"""

from .snippets import intel_for_player, intel_for_team
from .sync import sync_intel

__all__ = ["intel_for_player", "intel_for_team", "sync_intel"]
