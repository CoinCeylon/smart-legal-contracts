from fastapi import APIRouter, status
from app.schemas import query_schema
from app.crud import query_crud

router = APIRouter(
    prefix="/query",
    tags=["talk with cardano network"],
)

@router.post("/", response_model=query_schema.QueryOutput, status_code=status.HTTP_201_CREATED)
async def query(query: query_schema.QueryBase):
    return query_crud.query(query)

@router.post("/test")
async def test_query():
    return {"message": "Test query endpoint"}