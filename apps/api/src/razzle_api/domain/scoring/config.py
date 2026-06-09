from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Position = Literal["QB", "RB", "WR", "TE", "K", "DST", "DL", "LB", "DB", "IDP"]
LeagueFormat = Literal["dynasty", "redraft", "keeper", "best_ball"]
WaiverType = Literal["faab", "rolling", "reverse"]


class YardageBonus(BaseModel):
    model_config = ConfigDict(extra="forbid")

    threshold: float
    points: float


class RangeRule(BaseModel):
    model_config = ConfigDict(extra="forbid")

    min_value: float
    max_value: float | None = None
    points: float

    def matches(self, value: float) -> bool:
        if value < self.min_value:
            return False
        return self.max_value is None or value <= self.max_value


class PassingRules(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pass_att: float = 0.0
    pass_cmp: float = 0.0
    pass_inc: float = 0.0
    pass_yd: float = 0.04
    pass_td: float = 4.0
    pass_int: float = -2.0
    pass_pick_six: float = 0.0
    pass_sack: float = 0.0
    pass_first_down: float = 0.0
    pass_two_pt: float = 2.0
    pass_40_yd_bonus: float = 0.0
    pass_40_yd_td_bonus: float = 0.0
    pass_yardage_bonuses: list[YardageBonus] = Field(
        default_factory=lambda: [
            YardageBonus(threshold=300, points=0.0),
            YardageBonus(threshold=400, points=0.0),
        ]
    )


class RushingRules(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rush_att: float = 0.0
    rush_yd: float = 0.1
    rush_td: float = 6.0
    rush_first_down: float = 0.0
    rush_two_pt: float = 2.0
    rush_40_yd_bonus: float = 0.0
    rush_40_yd_td_bonus: float = 0.0
    rush_yardage_bonuses: list[YardageBonus] = Field(
        default_factory=lambda: [
            YardageBonus(threshold=100, points=0.0),
            YardageBonus(threshold=200, points=0.0),
        ]
    )


class ReceivingRules(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target: float = 0.0
    rec: float = 1.0
    rec_yd: float = 0.1
    rec_td: float = 6.0
    rec_first_down: float = 0.0
    rec_two_pt: float = 2.0
    te_premium: float = 0.0
    rec_40_yd_bonus: float = 0.0
    rec_40_yd_td_bonus: float = 0.0
    rec_yardage_bonuses: list[YardageBonus] = Field(
        default_factory=lambda: [
            YardageBonus(threshold=100, points=0.0),
            YardageBonus(threshold=200, points=0.0),
        ]
    )


class MiscRules(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fumble: float = 0.0
    fumble_lost: float = -2.0
    fumble_rec: float = 0.0
    fumble_rec_td: float = 6.0
    offensive_fumble_recovery_td: float = 6.0
    return_yd: float = 0.0
    return_td: float = 6.0
    special_teams_td: float = 6.0
    two_pt: float = 2.0


class KickingRules(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pat_made: float = 1.0
    pat_missed: float = -1.0
    fg_made: float = 0.0
    fg_missed: float = -1.0
    fg_made_ranges: list[RangeRule] = Field(
        default_factory=lambda: [
            RangeRule(min_value=0, max_value=19, points=3.0),
            RangeRule(min_value=20, max_value=29, points=3.0),
            RangeRule(min_value=30, max_value=39, points=3.0),
            RangeRule(min_value=40, max_value=49, points=4.0),
            RangeRule(min_value=50, max_value=None, points=5.0),
        ]
    )
    fg_missed_ranges: list[RangeRule] = Field(default_factory=list)


class DefenseRules(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sack: float = 1.0
    interception: float = 2.0
    fumble_recovery: float = 2.0
    td: float = 6.0
    safety: float = 2.0
    blocked_kick: float = 2.0
    forced_fumble: float = 0.0
    tackle_for_loss: float = 0.0
    qb_hit: float = 0.0
    points_allowed_ranges: list[RangeRule] = Field(
        default_factory=lambda: [
            RangeRule(min_value=0, max_value=0, points=10.0),
            RangeRule(min_value=1, max_value=6, points=7.0),
            RangeRule(min_value=7, max_value=13, points=4.0),
            RangeRule(min_value=14, max_value=20, points=1.0),
            RangeRule(min_value=21, max_value=27, points=0.0),
            RangeRule(min_value=28, max_value=34, points=-1.0),
            RangeRule(min_value=35, max_value=None, points=-4.0),
        ]
    )
    yards_allowed_ranges: list[RangeRule] = Field(default_factory=list)


class IdpRules(BaseModel):
    model_config = ConfigDict(extra="forbid")

    solo_tackle: float = 1.0
    assisted_tackle: float = 0.5
    tackle_for_loss: float = 1.0
    sack: float = 2.0
    qb_hit: float = 0.0
    interception: float = 3.0
    pass_defended: float = 1.0
    forced_fumble: float = 2.0
    fumble_recovery: float = 2.0
    td: float = 6.0
    safety: float = 2.0
    blocked_kick: float = 2.0


class ScoringRules(BaseModel):
    model_config = ConfigDict(extra="forbid")

    passing: PassingRules = Field(default_factory=PassingRules)
    rushing: RushingRules = Field(default_factory=RushingRules)
    receiving: ReceivingRules = Field(default_factory=ReceivingRules)
    misc: MiscRules = Field(default_factory=MiscRules)
    kicking: KickingRules = Field(default_factory=KickingRules)
    defense: DefenseRules = Field(default_factory=DefenseRules)
    idp: IdpRules = Field(default_factory=IdpRules)
    version: int = 1


class RosterConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    qb: int = 1
    rb: int = 2
    wr: int = 2
    te: int = 1
    flex: int = 1
    superflex: int = 0
    k: int = 1
    dst: int = 1
    idp: int = 0
    bench: int = 6
    ir: int = 2
    taxi: int = 0


class LeagueConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")

    league_size: int = 12
    format: LeagueFormat = "dynasty"
    scoring: ScoringRules = Field(default_factory=ScoringRules)
    roster: RosterConfig = Field(default_factory=RosterConfig)
    waiver_type: WaiverType = "faab"
    faab_budget: int = 100
    trade_deadline_week: int = 11
    playoff_teams: int = 6
    playoff_start_week: int = 15
