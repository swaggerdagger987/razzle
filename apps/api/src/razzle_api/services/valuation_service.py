from razzle_api.domain.scoring.config import LeagueConfig
from razzle_api.domain.valuation.vorp import ProjectionRow, ValuedPlayer, value_players


class ValuationService:
    def preview_vorp(
        self,
        *,
        players: list[ProjectionRow],
        config: LeagueConfig,
    ) -> list[ValuedPlayer]:
        return value_players(players, config)
