import os
from dotenv import load_dotenv
from blockfrost import ApiUrls

# Load environment variables from .env file
load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Blockfrost API Configuration
BLOCKFROST_PROJECT_ID  = os.getenv("BLOCKFROST_PROJECT_ID")
BLOCKFROST_BASE_URL = os.getenv("BLOCKFROST_BASE_URL", ApiUrls.preview.value)

# ChromaDB Configuration
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_data")

# LLM Configuration
MODELS = ['text-embedding-3-small', 'gpt-3.5-turbo', 'gpt-4o-mini']
TEMPERATURE = 0.1