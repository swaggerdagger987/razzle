from razzle_api.domain.scoring.config import Position, ScoringRules
from razzle_api.domain.scoring.engine import PlayerWeekStats, score_week


class ScoringService:
    def preview(self, *, stats: PlayerWeekStats, rules: ScoringRules, position: Position) -> float:
        return score_week(stats, rules, position)
