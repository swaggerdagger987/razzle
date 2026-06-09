from razzle_api.domain.scoring.config import LeagueConfig, ReceivingRules, ScoringRules


def ppr() -> LeagueConfig:
    return LeagueConfig(scoring=ScoringRules(receiving=ReceivingRules(rec=1.0)))


def half_ppr() -> LeagueConfig:
    return LeagueConfig(scoring=ScoringRules(receiving=ReceivingRules(rec=0.5)))


def standard() -> LeagueConfig:
    return LeagueConfig(scoring=ScoringRules(receiving=ReceivingRules(rec=0.0)))


def tight_end_premium(premium: float = 0.5) -> LeagueConfig:
    return LeagueConfig(scoring=ScoringRules(receiving=ReceivingRules(rec=1.0, te_premium=premium)))
