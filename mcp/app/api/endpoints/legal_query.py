from fastapi import APIRouter, Request, status
from app.schemas import legalQuery_schema
from app.crud import legalQuery_crud

router = APIRouter(
    prefix="/legalquery",
    tags=["Legal Assistant"],
)

@router.post("/", response_model=legalQuery_schema.LegalQueryOutput, status_code=status.HTTP_201_CREATED)
async def query(query: legalQuery_schema.LegalQueryBase):
    return legalQuery_crud.query(query)
