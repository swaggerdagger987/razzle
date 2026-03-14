"""
live_data package -- split from monolithic live_data.py.

Re-exports all public functions so that `from . import live_data`
in server.py continues to work as `live_data.func()`.
"""

# --- core helpers & constants ---
from .core import (  # noqa: F401
    FANTASY_POSITIONS,
    compute_trade_value,
    ABBREV_TO_TEAM,
)

# --- players (NFL CRUD, screener, profiles) ---
from .players import (  # noqa: F401
    db_stats,
    quick_search_players,
    fetch_players,
    fetch_screener,
    get_filter_options,
    fetch_player_weeks,
    fetch_player_seasons,
    fetch_player_profile,
    fetch_players_compare,
    fetch_team_roster,
    fetch_career_stats,
    fetch_player_percentiles,
    fetch_player_strengths,
    fetch_points_breakdown,
    fetch_game_log,
    fetch_compare_table,
    fetch_player_boom_bust,
    fetch_player_comps,
    fetch_screener_sparklines,
)

# --- prospects ---
from .prospects import (  # noqa: F401
    fetch_prospects,
    fetch_prospect_years,
    fetch_prospect_profile,
    fetch_prospect_comps,
    fetch_prospect_tiers,
    fetch_prospects_compare,
    fetch_prospect_scores,
    fetch_draft_class_analytics,
    fetch_athletic_radar,
)

# --- college ---
from .college import (  # noqa: F401
    fetch_college_players,
    fetch_college_player_profile,
    fetch_college_filter_options,
    fetch_college_breakouts,
    fetch_college_efficiency,
    fetch_college_leaders,
    fetch_college_trends,
    fetch_college_rankings,
    fetch_college_streaks,
    fetch_college_stock_watch,
    fetch_college_scarcity,
    fetch_college_consistency,
    fetch_college_workload,
    fetch_college_dual_threat,
    fetch_college_snap_efficiency,
    fetch_college_aging_curves,
    fetch_college_records,
    fetch_college_season_recap,
    fetch_college_season_awards,
    fetch_college_stat_explorer,
)

# --- storage (waitlist, formula store, analytics) ---
from .storage import (  # noqa: F401
    init_waitlist_table,
    add_to_waitlist,
    init_formula_store_tables,
    publish_formula,
    fetch_formula_store,
    get_formula_detail,
    rate_formula,
    log_pageview,
    log_event,
    get_analytics_summary,
    _init_analytics_table,
)

# --- dynasty ---
from .dynasty import (  # noqa: F401
    fetch_trade_values,
    fetch_pick_values,
    fetch_roster_value,
    fetch_dynasty_rankings,
    fetch_dynasty_history,
    fetch_trade_value_chart,
    fetch_trade_finder,
    fetch_league_trade_values,
    fetch_roster_grade,
    fetch_auction_values,
    fetch_dynasty_dashboard,
    fetch_tier_list,
    fetch_dynasty_power_rankings,
    fetch_roster_depth_lookup,
)

# --- analytics (heatmaps, leaders, scarcity, breakouts, explorer, ...) ---
from .analytics import (  # noqa: F401
    EXPLORER_METRICS,
    fetch_heatmap,
    fetch_stat_leaders,
    fetch_positional_scarcity,
    fetch_breakout_candidates,
    fetch_buy_sell_candidates,
    fetch_stat_explorer,
    fetch_aging_curves,
    fetch_weekly_heatmap,
    fetch_target_distribution,
    fetch_matchup_heatmap,
    fetch_usage_trends,
    fetch_year_over_year,
    fetch_air_yards,
    fetch_redzone_usage,
)

# --- dashboards (efficiency, consistency, SOS, stock watch, ...) ---
from .dashboards import (  # noqa: F401
    fetch_efficiency_rankings,
    fetch_consistency_rankings,
    fetch_strength_of_schedule,
    fetch_stock_watch,
    fetch_opportunity_share,
    fetch_report_cards,
    fetch_season_awards,
    fetch_vorp,
    fetch_stat_correlations,
)

# --- tools (scoring, cheat sheet, archetypes, featured, ...) ---
from .tools import (  # noqa: F401
    fetch_featured,
    fetch_scoring_comparison,
    fetch_cheat_sheet,
    fetch_player_archetypes,
    fetch_draft_class,
    fetch_weekly_leaders,
    fetch_pace_tracker,
    fetch_streaks,
    fetch_season_recap,
    fetch_records,
    fetch_waivers,
    fetch_playoff_schedule,
    fetch_fpts_breakdown,
    fetch_garbage_time,
    fetch_snap_efficiency,
    fetch_handcuffs,
    fetch_weekly_mvp,
    fetch_stacks,
    fetch_positional_advantage,
    fetch_td_regression,
    fetch_dual_threat,
    fetch_season_pace,
    fetch_target_premium,
    fetch_workload_monitor,
    fetch_drop_rate,
    fetch_success_rate,
    fetch_game_script,
    fetch_draft_class_tracker,
)
