from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import OPENAI_API_KEY, MODELS
import shutil
import os

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

embeddings = OpenAIEmbeddings(
    model=MODELS[0],
)

cardano_data_path = './data/cardano'
civil_law_data_path = './data/civil_law'
corporate_law_data_path = './data/corporate_law'
property_law_data_path = './data/property_law'

cardano_store_path = './db/cardano'
civil_law_store_path = './db/civil_law'
corporate_law_store_path = './db/corporate_law'
property_law_store_path = './db/property_law'

def setup_vector_store(data_path: str, store_path: str):
    loader = DirectoryLoader(data_path, glob="*.pdf", show_progress=True, loader_cls=PyPDFLoader)
    docs = loader.load()

    print(f"Loaded {len(docs)} documents.")

    text_splitter = RecursiveCharacterTextSplitter()
    split_docs = text_splitter.split_documents(docs)

    # Create a Chroma vector store (persistent)
    Chroma.from_documents(
        documents=split_docs,
        embedding=embeddings,
        persist_directory=store_path,
    )

    print("Chroma vector store setup complete.")


def search_vector_store(query: str, store_path: str):
    vector_store = Chroma(
        persist_directory=store_path,
        embedding_function=embeddings
    )

    results = vector_store.similarity_search(query, k=4)

    simplified_results = [
        {
            "page_content": doc.page_content,
            "source": doc.metadata.get("source", "Unknown Source")
        }
        for doc in results
    ]

    print(simplified_results)
    return simplified_results

def clear_vector_store(store_path: str):
    """Properly close and delete the Chroma vector store."""
    if os.path.exists(store_path):
        try:
            # Load the vector store to get the persistent client
            vs = Chroma(persist_directory=store_path, embedding_function=embeddings)
            vs._client.reset()  # This clears and releases the files
        except Exception as e:
            print(f"Error closing Chroma before deletion: {e}")
        
        try:
            shutil.rmtree(store_path)
            print("Chroma DB cleared.")
        except Exception as e:
            print(f"Error deleting Chroma DB folder: {e}")
    else:
        print("No vector store found to clear.")


