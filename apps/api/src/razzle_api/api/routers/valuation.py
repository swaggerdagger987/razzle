from fastapi import APIRouter

from razzle_api.api.schemas.valuation import VorpPreviewRequest, VorpPreviewResponse
from razzle_api.services.valuation_service import ValuationService

router = APIRouter(prefix="/valuation", tags=["valuation"])


@router.post("/vorp/preview", response_model=VorpPreviewResponse)
async def preview_vorp(request: VorpPreviewRequest) -> VorpPreviewResponse:
    service = ValuationService()
    players = service.preview_vorp(players=request.players, config=request.config)
    return VorpPreviewResponse(players=players)
