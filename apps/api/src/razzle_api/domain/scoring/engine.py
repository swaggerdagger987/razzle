from pydantic import BaseModel, ConfigDict

from razzle_api.domain.scoring.config import Position, RangeRule, ScoringRules, YardageBonus


class PlayerWeekStats(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pass_att: float = 0.0
    pass_cmp: float = 0.0
    pass_inc: float = 0.0
    pass_yd: float = 0.0
    pass_td: float = 0.0
    pass_int: float = 0.0
    pass_pick_six: float = 0.0
    pass_sack: float = 0.0
    pass_first_down: float = 0.0
    pass_two_pt: float = 0.0
    pass_40_yd: float = 0.0
    pass_40_yd_td: float = 0.0
    rush_att: float = 0.0
    rush_yd: float = 0.0
    rush_td: float = 0.0
    rush_first_down: float = 0.0
    rush_two_pt: float = 0.0
    rush_40_yd: float = 0.0
    rush_40_yd_td: float = 0.0
    target: float = 0.0
    rec: float = 0.0
    rec_yd: float = 0.0
    rec_td: float = 0.0
    rec_first_down: float = 0.0
    rec_two_pt: float = 0.0
    rec_40_yd: float = 0.0
    rec_40_yd_td: float = 0.0
    fumble: float = 0.0
    fumble_lost: float = 0.0
    fumble_rec: float = 0.0
    fumble_rec_td: float = 0.0
    offensive_fumble_recovery_td: float = 0.0
    return_yd: float = 0.0
    return_td: float = 0.0
    special_teams_td: float = 0.0
    two_pt: float = 0.0
    pat_made: float = 0.0
    pat_missed: float = 0.0
    fg_made: float = 0.0
    fg_missed: float = 0.0
    fg_made_0_19: float = 0.0
    fg_made_20_29: float = 0.0
    fg_made_30_39: float = 0.0
    fg_made_40_49: float = 0.0
    fg_made_50_plus: float = 0.0
    fg_missed_0_19: float = 0.0
    fg_missed_20_29: float = 0.0
    fg_missed_30_39: float = 0.0
    fg_missed_40_49: float = 0.0
    fg_missed_50_plus: float = 0.0
    dst_sack: float = 0.0
    dst_int: float = 0.0
    dst_fumble_recovery: float = 0.0
    dst_td: float = 0.0
    dst_safety: float = 0.0
    dst_blocked_kick: float = 0.0
    dst_forced_fumble: float = 0.0
    dst_tackle_for_loss: float = 0.0
    dst_qb_hit: float = 0.0
    dst_points_allowed: float | None = None
    dst_yards_allowed: float | None = None
    idp_solo_tackle: float = 0.0
    idp_assisted_tackle: float = 0.0
    idp_tackle_for_loss: float = 0.0
    idp_sack: float = 0.0
    idp_qb_hit: float = 0.0
    idp_int: float = 0.0
    idp_pass_defended: float = 0.0
    idp_forced_fumble: float = 0.0
    idp_fumble_recovery: float = 0.0
    idp_td: float = 0.0
    idp_safety: float = 0.0
    idp_blocked_kick: float = 0.0


def score_week(stats: PlayerWeekStats, rules: ScoringRules, position: Position = "RB") -> float:
    return round(
        _score_passing(stats, rules)
        + _score_rushing(stats, rules)
        + _score_receiving(stats, rules, position)
        + _score_misc(stats, rules)
        + _score_kicking(stats, rules)
        + _score_defense(stats, rules)
        + _score_idp(stats, rules),
        4,
    )


def _score_passing(stats: PlayerWeekStats, rules: ScoringRules) -> float:
    passing = rules.passing
    return (
        stats.pass_att * passing.pass_att
        + stats.pass_cmp * passing.pass_cmp
        + stats.pass_inc * passing.pass_inc
        + stats.pass_yd * passing.pass_yd
        + stats.pass_td * passing.pass_td
        + stats.pass_int * passing.pass_int
        + stats.pass_pick_six * passing.pass_pick_six
        + stats.pass_sack * passing.pass_sack
        + stats.pass_first_down * passing.pass_first_down
        + stats.pass_two_pt * passing.pass_two_pt
        + stats.pass_40_yd * passing.pass_40_yd_bonus
        + stats.pass_40_yd_td * passing.pass_40_yd_td_bonus
        + _yardage_bonus(stats.pass_yd, passing.pass_yardage_bonuses)
    )


def _score_rushing(stats: PlayerWeekStats, rules: ScoringRules) -> float:
    rushing = rules.rushing
    return (
        stats.rush_att * rushing.rush_att
        + stats.rush_yd * rushing.rush_yd
        + stats.rush_td * rushing.rush_td
        + stats.rush_first_down * rushing.rush_first_down
        + stats.rush_two_pt * rushing.rush_two_pt
        + stats.rush_40_yd * rushing.rush_40_yd_bonus
        + stats.rush_40_yd_td * rushing.rush_40_yd_td_bonus
        + _yardage_bonus(stats.rush_yd, rushing.rush_yardage_bonuses)
    )


def _score_receiving(stats: PlayerWeekStats, rules: ScoringRules, position: Position) -> float:
    receiving = rules.receiving
    rec_value = receiving.rec + (receiving.te_premium if position == "TE" else 0.0)
    return (
        stats.target * receiving.target
        + stats.rec * rec_value
        + stats.rec_yd * receiving.rec_yd
        + stats.rec_td * receiving.rec_td
        + stats.rec_first_down * receiving.rec_first_down
        + stats.rec_two_pt * receiving.rec_two_pt
        + stats.rec_40_yd * receiving.rec_40_yd_bonus
        + stats.rec_40_yd_td * receiving.rec_40_yd_td_bonus
        + _yardage_bonus(stats.rec_yd, receiving.rec_yardage_bonuses)
    )


def _score_misc(stats: PlayerWeekStats, rules: ScoringRules) -> float:
    misc = rules.misc
    return (
        stats.fumble * misc.fumble
        + stats.fumble_lost * misc.fumble_lost
        + stats.fumble_rec * misc.fumble_rec
        + stats.fumble_rec_td * misc.fumble_rec_td
        + stats.offensive_fumble_recovery_td * misc.offensive_fumble_recovery_td
        + stats.return_yd * misc.return_yd
        + stats.return_td * misc.return_td
        + stats.special_teams_td * misc.special_teams_td
        + stats.two_pt * misc.two_pt
    )


def _score_kicking(stats: PlayerWeekStats, rules: ScoringRules) -> float:
    kicking = rules.kicking
    made_by_range = _distance_score(_made_field_goals(stats), kicking.fg_made_ranges)
    missed_by_range = _distance_score(_missed_field_goals(stats), kicking.fg_missed_ranges)
    return (
        stats.pat_made * kicking.pat_made
        + stats.pat_missed * kicking.pat_missed
        + stats.fg_made * kicking.fg_made
        + stats.fg_missed * kicking.fg_missed
        + made_by_range
        + missed_by_range
    )


def _score_defense(stats: PlayerWeekStats, rules: ScoringRules) -> float:
    defense = rules.defense
    points_allowed = _range_score(stats.dst_points_allowed, defense.points_allowed_ranges)
    yards_allowed = _range_score(stats.dst_yards_allowed, defense.yards_allowed_ranges)
    return (
        stats.dst_sack * defense.sack
        + stats.dst_int * defense.interception
        + stats.dst_fumble_recovery * defense.fumble_recovery
        + stats.dst_td * defense.td
        + stats.dst_safety * defense.safety
        + stats.dst_blocked_kick * defense.blocked_kick
        + stats.dst_forced_fumble * defense.forced_fumble
        + stats.dst_tackle_for_loss * defense.tackle_for_loss
        + stats.dst_qb_hit * defense.qb_hit
        + points_allowed
        + yards_allowed
    )


def _score_idp(stats: PlayerWeekStats, rules: ScoringRules) -> float:
    idp = rules.idp
    return (
        stats.idp_solo_tackle * idp.solo_tackle
        + stats.idp_assisted_tackle * idp.assisted_tackle
        + stats.idp_tackle_for_loss * idp.tackle_for_loss
        + stats.idp_sack * idp.sack
        + stats.idp_qb_hit * idp.qb_hit
        + stats.idp_int * idp.interception
        + stats.idp_pass_defended * idp.pass_defended
        + stats.idp_forced_fumble * idp.forced_fumble
        + stats.idp_fumble_recovery * idp.fumble_recovery
        + stats.idp_td * idp.td
        + stats.idp_safety * idp.safety
        + stats.idp_blocked_kick * idp.blocked_kick
    )


def _yardage_bonus(yards: float, bonuses: list[YardageBonus]) -> float:
    return sum(bonus.points for bonus in bonuses if yards >= bonus.threshold)


def _range_score(value: float | None, ranges: list[RangeRule]) -> float:
    if value is None:
        return 0.0
    return next((rule.points for rule in ranges if rule.matches(value)), 0.0)


def _distance_score(counts_by_distance: dict[float, float], ranges: list[RangeRule]) -> float:
    return sum(
        count * _range_score(distance, ranges) for distance, count in counts_by_distance.items()
    )


def _made_field_goals(stats: PlayerWeekStats) -> dict[float, float]:
    return {
        19: stats.fg_made_0_19,
        29: stats.fg_made_20_29,
        39: stats.fg_made_30_39,
        49: stats.fg_made_40_49,
        50: stats.fg_made_50_plus,
    }


def _missed_field_goals(stats: PlayerWeekStats) -> dict[float, float]:
    return {
        19: stats.fg_missed_0_19,
        29: stats.fg_missed_20_29,
        39: stats.fg_missed_30_39,
        49: stats.fg_missed_40_49,
        50: stats.fg_missed_50_plus,
    }
