from langchain_core.tools import tool
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from typing import List

class LegalPropertyKnowledgeBaseClient:
    def __init__(self):
        self.db_path = './db/property_law'
        self.embeddings = OpenAIEmbeddings()
        self.vector_store = Chroma(
            persist_directory=self.db_path,
            embedding_function=self.embeddings
        )
        self.retriever = self.vector_store.as_retriever(k=4)
    
    def search_knowledge_base(self, query: str) -> List[Document]:
        """Search the knowledge base for relevant documents"""
        try:
            docs = self.retriever.invoke(query)
            # debugging: print the documents found
            print(docs)
            return docs
        except Exception as e:
            return [Document(page_content=f"Error searching knowledge base: {str(e)}")]
        

class CivilLawKnowledgeBaseClient:
    def __init__(self):
        self.db_path = './db/civil_law'
        self.embeddings = OpenAIEmbeddings()
        self.vector_store = Chroma(
            persist_directory=self.db_path,
            embedding_function=self.embeddings
        )
        self.retriever = self.vector_store.as_retriever(k=4)
    
    def search_knowledge_base(self, query: str) -> List[Document]:
        """Search the knowledge base for relevant documents"""
        try:
            docs = self.retriever.invoke(query)
            # debugging: print the documents found
            print(docs)
            return docs
        except Exception as e:
            return [Document(page_content=f"Error searching knowledge base: {str(e)}")]
        

class CorporateLawKnowledgeBaseClient:
    def __init__(self):
        self.db_path = './db/corporate_law'
        self.embeddings = OpenAIEmbeddings()
        self.vector_store = Chroma(
            persist_directory=self.db_path,
            embedding_function=self.embeddings
        )
        self.retriever = self.vector_store.as_retriever(k=4)
    
    def search_knowledge_base(self, query: str) -> List[Document]:
        """Search the knowledge base for relevant documents"""
        try:
            docs = self.retriever.invoke(query)
            # debugging: print the documents found
            print(docs)
            return docs
        except Exception as e:
            return [Document(page_content=f"Error searching knowledge base: {str(e)}")]

# Initialize knowledge base client
lp_client = LegalPropertyKnowledgeBaseClient()
cl_client = CivilLawKnowledgeBaseClient()
co_client = CorporateLawKnowledgeBaseClient()

@tool
def search_legal_property_law_knowledge(query: str) -> str:
    """
    Search the legal property law knowledge base for relevant information.
    Args:
        query (str): The search query to find relevant legal property law information.
    Returns:
        str: A formatted string containing the search results or an error message.
    """
    if not query:
        return "Please provide a search query."
    
    # Search knowledge base
    docs = lp_client.search_knowledge_base(query)
    print("======================")
    print("leagal property tool triggered")
    print("======================")
    if not docs:
        return "No relevant information found in the knowledge base."
    
    # Format results
    results = []
    for i, doc in enumerate(docs, 1):
        content = doc.page_content[:500] + "..." if len(doc.page_content) > 500 else doc.page_content
        results.append(f"**Result {i}:**\n{content}")
    
    return "\n\n".join(results)

@tool
def search_civil_law_knowledge(query: str) -> str:
    """
    Search the civil law knowledge base for relevant information.
    Args:
        query (str): The search query to find relevant civil law information.
    Returns:
        str: A formatted string containing the search results or an error message.
    """
    if not query:
        return "Please provide a search query."
    
    # Search knowledge base
    docs = cl_client.search_knowledge_base(query)
    print("======================")
    print("civil law tool triggered")
    print("======================")
    
    if not docs:
        return "No relevant information found in the knowledge base."
    
    # Format results
    results = []
    for i, doc in enumerate(docs, 1):
        content = doc.page_content[:500] + "..." if len(doc.page_content) > 500 else doc.page_content
        results.append(f"**Result {i}:**\n{content}")
    
    return "\n\n".join(results)

@tool
def search_corporate_law_knowledge(query: str) -> str:
    """
    Search the corporate law knowledge base for relevant information.
    Args:
        query (str): The search query to find relevant corporate law information.
    Returns:
        str: A formatted string containing the search results or an error message.
    """
    if not query:
        return "Please provide a search query."
    
    # Search knowledge base
    docs = co_client.search_knowledge_base(query)
    print("======================")
    print("corporate law tool triggered")
    print("======================")
    
    if not docs:
        return "No relevant information found in the knowledge base."
    
    # Format results
    results = []
    for i, doc in enumerate(docs, 1):
        content = doc.page_content[:500] + "..." if len(doc.page_content) > 500 else doc.page_content
        results.append(f"**Result {i}:**\n{content}")
    
    return "\n\n".join(results)


