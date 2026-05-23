"""Bureau of Intelligence — Sleeper-connected league analysis.

One file per feature. Each implementation receives a fetched LeagueContext
(rosters + users + transactions + matchups) and returns a typed result.

The eight Bureau features are the "context as a moat" play. ChatGPT
has the LLM; ChatGPT does NOT have your specific league state.
"""

from .self_scout import self_scout
from .roster_depth import roster_depth
from .build_profiles import build_profiles
from .power_rankings import power_rankings
from .trade_network import trade_network
from .waiver_tendencies import waiver_tendencies
from .head_to_head import head_to_head
from .strength_of_schedule import strength_of_schedule
from .monte_carlo import monte_carlo_projections
from .player_status import player_league_status
from .manager_profiles import manager_profiles
from .pressure_map import pressure_map
from .trade_finder import trade_finder
from .scenario_trade import scenario_trade

__all__ = [
    "self_scout",
    "roster_depth",
    "build_profiles",
    "power_rankings",
    "trade_network",
    "waiver_tendencies",
    "head_to_head",
    "strength_of_schedule",
    "monte_carlo_projections",
    "player_league_status",
    "manager_profiles",
    "pressure_map",
    "trade_finder",
    "scenario_trade",
]
