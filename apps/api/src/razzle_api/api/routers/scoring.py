from fastapi import APIRouter

from razzle_api.api.schemas.scoring import ScoringPreviewRequest, ScoringPreviewResponse
from razzle_api.services.scoring_service import ScoringService

router = APIRouter(prefix="/scoring", tags=["scoring"])


@router.post("/preview", response_model=ScoringPreviewResponse)
async def preview_score(request: ScoringPreviewRequest) -> ScoringPreviewResponse:
    service = ScoringService()
    points = service.preview(stats=request.stats, rules=request.rules, position=request.position)
    return ScoringPreviewResponse(points=points)
