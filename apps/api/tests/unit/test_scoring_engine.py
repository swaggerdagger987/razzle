from hypothesis import given
from hypothesis import strategies as st

from razzle_api.domain.scoring.config import (
    DefenseRules,
    KickingRules,
    PassingRules,
    RangeRule,
    ReceivingRules,
    RushingRules,
    ScoringRules,
    YardageBonus,
)
from razzle_api.domain.scoring.engine import PlayerWeekStats, score_week


def test_score_week_uses_default_ppr_rules() -> None:
    stats = PlayerWeekStats(pass_yd=250, pass_td=2, rush_yd=20, rec=5, rec_yd=40)
    assert score_week(stats, ScoringRules()) == 29.0


def test_te_premium_only_applies_to_tight_ends() -> None:
    rules = ScoringRules(receiving=ReceivingRules(rec=1.0, te_premium=0.75))
    stats = PlayerWeekStats(rec=6)

    assert score_week(stats, rules, position="TE") == 10.5
    assert score_week(stats, rules, position="WR") == 6.0


def test_yardage_bonuses_stack_when_thresholds_are_met() -> None:
    rules = ScoringRules(
        passing=PassingRules(
            pass_yardage_bonuses=[
                YardageBonus(threshold=300, points=3),
                YardageBonus(threshold=400, points=5),
            ]
        ),
        rushing=RushingRules(rush_yardage_bonuses=[YardageBonus(threshold=100, points=2)]),
    )
    stats = PlayerWeekStats(pass_yd=410, rush_yd=120)

    assert score_week(stats, rules) == 38.4


def test_kicker_distance_ranges_score_made_field_goals() -> None:
    rules = ScoringRules(kicking=KickingRules(fg_made=0.0))
    stats = PlayerWeekStats(fg_made_20_29=1, fg_made_40_49=2, fg_made_50_plus=1, pat_made=3)

    assert score_week(stats, rules, position="K") == 19.0


def test_custom_missed_field_goal_ranges_override_flat_miss_penalty() -> None:
    rules = ScoringRules(
        kicking=KickingRules(
            fg_missed=0.0,
            fg_missed_ranges=[
                RangeRule(min_value=0, max_value=29, points=-2),
                RangeRule(min_value=30, max_value=None, points=-1),
            ],
        )
    )
    stats = PlayerWeekStats(fg_missed_20_29=1, fg_missed_40_49=2)

    assert score_week(stats, rules, position="K") == -4.0


def test_defense_scores_event_stats_and_points_allowed_tier() -> None:
    rules = ScoringRules(defense=DefenseRules())
    stats = PlayerWeekStats(
        dst_sack=3,
        dst_int=1,
        dst_fumble_recovery=1,
        dst_td=1,
        dst_safety=1,
        dst_points_allowed=10,
    )

    assert score_week(stats, rules, position="DST") == 19.0


@given(
    yards=st.floats(min_value=0, max_value=600, allow_nan=False, allow_infinity=False),
    multiplier=st.floats(min_value=-1, max_value=1, allow_nan=False, allow_infinity=False),
)
def test_yardage_scoring_is_linear_when_no_bonuses(yards: float, multiplier: float) -> None:
    rules = ScoringRules(
        passing=PassingRules(pass_yd=multiplier, pass_yardage_bonuses=[]),
        rushing=RushingRules(rush_yardage_bonuses=[]),
        receiving=ReceivingRules(rec_yardage_bonuses=[]),
    )

    assert score_week(PlayerWeekStats(pass_yd=yards), rules) == round(yards * multiplier, 4)
