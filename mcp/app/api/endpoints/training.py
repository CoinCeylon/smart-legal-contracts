from fastapi import APIRouter, status
from app.utils.vectorize import setup_vector_store


router = APIRouter(
    prefix="/training",
    tags=["Setting up vector databases"],
)

cardano_data_path = './data/cardano'
civil_law_data_path = './data/civil_law'
corporate_law_data_path = './data/corporate_law'
property_law_data_path = './data/property_law'

cardano_store_path = './db/cardano'
civil_law_store_path = './db/civil_law'
corporate_law_store_path = './db/corporate_law'
property_law_store_path = './db/property_law'

@router.get("/setup_cardano_vector_db", status_code=status.HTTP_200_OK)
async def setup_cardano_vector_db():
    """Set up the Cardano vector database."""
    setup_vector_store(cardano_data_path, cardano_store_path)
    return {"message": "Cardano vector database setup complete."}

@router.get("/setup_civil_law_vector_db", status_code=status.HTTP_200_OK)
async def setup_civil_law_vector_db():
    """Set up the Civil Law vector database."""
    setup_vector_store(civil_law_data_path, civil_law_store_path)
    return {"message": "Civil Law vector database setup complete."}

@router.get("/setup_corporate_law_vector_db", status_code=status.HTTP_200_OK)
async def setup_corporate_law_vector_db():
    """Set up the Corporate Law vector database."""
    setup_vector_store(corporate_law_data_path, corporate_law_store_path)
    return {"message": "Corporate Law vector database setup complete."}

@router.get("/setup_property_law_vector_db", status_code=status.HTTP_200_OK)
async def setup_property_law_vector_db():
    """Set up the Property Law vector database."""
    setup_vector_store(property_law_data_path, property_law_store_path)
    return {"message": "Property Law vector database setup complete."}

@router.get("/setup_all_vector_dbs", status_code=status.HTTP_200_OK)
async def setup_all_vector_dbs():
    """Set up all vector databases."""
    setup_vector_store(cardano_data_path, cardano_store_path)
    setup_vector_store(civil_law_data_path, civil_law_store_path)
    setup_vector_store(corporate_law_data_path, corporate_law_store_path)
    setup_vector_store(property_law_data_path, property_law_store_path)
    return {"message": "All vector databases setup complete."}

