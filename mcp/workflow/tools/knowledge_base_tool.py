from langchain_core.tools import tool
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document
from typing import List


class KnowledgeBaseClient:
    def __init__(self):
        self.db_path = './db/cardano'
        self.embeddings = OpenAIEmbeddings()
        self.vector_store = Chroma(
            persist_directory=self.db_path,
            embedding_function=self.embeddings
        )
        self.retriever = self.vector_store.as_retriever(k=2)
    
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
kb_client = KnowledgeBaseClient()

@tool
def search_cardano_knowledge(query: str) -> str:
    """
    Search the Cardano knowledge base for information about blockchain concepts,
    protocols, and frequently asked questions.
    
    Args:
        query: The search query or question about Cardano
    
    Returns:
        Relevant information from the knowledge base
    """
    if not query:
        return "Please provide a search query."
    
    # Search knowledge base
    docs = kb_client.search_knowledge_base(query)
    
    if not docs:
        return "No relevant information found in the knowledge base."
    
    # Format results
    results = []
    for i, doc in enumerate(docs, 1):
        content = doc.page_content[:500] + "..." if len(doc.page_content) > 500 else doc.page_content
        results.append(f"**Result {i}:**\n{content}")
    
    return "\n\n".join(results)

@tool
def get_cardano_faq(topic: str) -> str:
    """
    Get frequently asked questions and answers about specific Cardano topics.
    
    Args:
        topic: The topic to search for (e.g., 'staking', 'smart contracts', 'wallets')
    
    Returns:
        FAQ information related to the topic
    """
    if not topic:
        return "Please specify a topic to search for FAQ."
    
    # Search for FAQ-specific content
    faq_query = f"FAQ {topic} frequently asked questions"
    docs = kb_client.search_knowledge_base(faq_query)
    
    if not docs:
        return f"No FAQ information found for topic: {topic}"
    
    # Format FAQ results
    faq_content = []
    for doc in docs[:3]:  # Limit to top 3 results
        content = doc.page_content
        faq_content.append(content)
    
    return f"**FAQ for {topic}:**\n\n" + "\n\n".join(faq_content)
