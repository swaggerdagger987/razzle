from pydantic import BaseModel, ConfigDict, Field

from razzle_api.domain.scoring.config import Position, ScoringRules
from razzle_api.domain.scoring.engine import PlayerWeekStats


class ScoringPreviewRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    position: Position = "RB"
    stats: PlayerWeekStats
    rules: ScoringRules = Field(default_factory=ScoringRules)


class ScoringPreviewResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    points: float
