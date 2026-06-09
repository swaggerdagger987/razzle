from pydantic import BaseModel, ConfigDict, Field

from razzle_api.domain.scoring.config import LeagueConfig
from razzle_api.domain.valuation.vorp import ProjectionRow, ValuedPlayer


class VorpPreviewRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    players: list[ProjectionRow]
    config: LeagueConfig = Field(default_factory=LeagueConfig)


class VorpPreviewResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    players: list[ValuedPlayer]
