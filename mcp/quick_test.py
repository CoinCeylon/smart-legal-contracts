#!/usr/bin/env python3
"""
Quick Tool Test Runner
This script provides quick tests for individual tools and components.
"""

import sys
import os
from datetime import datetime

# Add current directory to Python path
sys.path.append('.')

def test_blockfrost_tools():
    """Test BlockFrost tools individually."""
    print("Testing BlockFrost Tools...")
    
    try:
        from workflow.tools.blockfrost_tool import (
            get_address_details, 
            get_transactions_for_address, 
            get_single_transaction_details
        )
        
        test_address = "addr_test1wryf65umuw5nuh8m4sjh9dka0mx7pwsmle0uyex8pf7f4ycj7y6tp"
        test_tx_hash = "4bcba01d2c775b545c783bbd49a9443bb0ac071c743c86eeddd6a814852288e5"
        
        print("\n1. Testing get_address_details...")
        try:
            result = get_address_details.invoke({"address": test_address})
            print(f"✓ Address details: {result[:100]}...")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        print("\n2. Testing get_transactions_for_address...")
        try:
            result = get_transactions_for_address.invoke({"address": test_address})
            print(f"✓ Transactions: {result[:100]}...")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        print("\n3. Testing get_single_transaction_details...")
        try:
            result = get_single_transaction_details.invoke({"tx_hash": test_tx_hash})
            print(f"✓ Transaction details: {result[:100]}...")
        except Exception as e:
            print(f"✗ Error: {e}")
            
    except ImportError as e:
        print(f"✗ Failed to import BlockFrost tools: {e}")

def test_legal_tools():
    """Test Legal tools individually."""
    print("\nTesting Legal Tools...")
    
    try:
        from workflow.tools.legal_data_tool import (
            search_civil_law_knowledge,
            search_corporate_law_knowledge,
            search_legal_property_law_knowledge
        )
        
        test_query = "contract requirements"
        
        print("\n1. Testing search_civil_law_knowledge...")
        try:
            result = search_civil_law_knowledge.invoke({"query": test_query})
            print(f"✓ Civil law search: {result[:100]}...")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        print("\n2. Testing search_corporate_law_knowledge...")
        try:
            result = search_corporate_law_knowledge.invoke({"query": test_query})
            print(f"✓ Corporate law search: {result[:100]}...")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        print("\n3. Testing search_legal_property_law_knowledge...")
        try:
            result = search_legal_property_law_knowledge.invoke({"query": test_query})
            print(f"✓ Property law search: {result[:100]}...")
        except Exception as e:
            print(f"✗ Error: {e}")
            
    except ImportError as e:
        print(f"✗ Failed to import Legal tools: {e}")

def test_knowledge_base_tools():
    """Test Knowledge base tools individually."""
    print("\nTesting Knowledge Base Tools...")
    
    try:
        from workflow.tools.knowledge_base_tool import search_cardano_knowledge
        
        test_query = "proof of stake consensus"
        
        print("\n1. Testing search_cardano_knowledge...")
        try:
            result = search_cardano_knowledge.invoke({"query": test_query})
            print(f"✓ Cardano knowledge search: {result[:100]}...")
        except Exception as e:
            print(f"✗ Error: {e}")
            
    except ImportError as e:
        print(f"✗ Failed to import Knowledge base tools: {e}")

def test_agents():
    """Test agents individually."""
    print("\nTesting Agents...")
    
    try:
        from workflow.agents.cardano_agent import CardanoAgent
        from workflow.agents.legal_assistant import LawyerAgent
        
        print("\n1. Testing CardanoAgent initialization...")
        try:
            cardano_agent = CardanoAgent()
            print("✓ CardanoAgent initialized successfully")
        except Exception as e:
            print(f"✗ CardanoAgent initialization failed: {e}")
        
        print("\n2. Testing LawyerAgent initialization...")
        try:
            legal_agent = LawyerAgent()
            print("✓ LawyerAgent initialized successfully")
        except Exception as e:
            print(f"✗ LawyerAgent initialization failed: {e}")
            
    except ImportError as e:
        print(f"✗ Failed to import Agents: {e}")

def test_configuration():
    """Test configuration loading."""
    print("\nTesting Configuration...")
    
    try:
        from app.core.config import (
            OPENAI_API_KEY, 
            BLOCKFROST_PROJECT_ID, 
            MODELS, 
            TEMPERATURE
        )
        
        print("1. Checking environment variables...")
        if OPENAI_API_KEY:
            if OPENAI_API_KEY.startswith('sk-'):
                print("✓ OpenAI API key is properly formatted")
            else:
                print("⚠ OpenAI API key doesn't look correct")
        else:
            print("✗ OpenAI API key is missing")
        
        if BLOCKFROST_PROJECT_ID:
            print("✓ Blockfrost Project ID is set")
        else:
            print("✗ Blockfrost Project ID is missing")
        
        print(f"✓ Models configured: {MODELS}")
        print(f"✓ Temperature set to: {TEMPERATURE}")
        
    except ImportError as e:
        print(f"✗ Failed to import configuration: {e}")

def test_database_connections():
    """Test database connections."""
    print("\nTesting Database Connections...")
    
    try:
        from langchain_chroma import Chroma
        from langchain_openai import OpenAIEmbeddings
        
        print("1. Testing ChromaDB connections...")
        
        db_paths = [
            './db/cardano',
            './db/civil_law', 
            './db/corporate_law',
            './db/property_law'
        ]
        
        embeddings = OpenAIEmbeddings()
        
        for db_path in db_paths:
            try:
                if os.path.exists(db_path):
                    vector_store = Chroma(
                        persist_directory=db_path,
                        embedding_function=embeddings
                    )
                    print(f"✓ {db_path} - Connected successfully")
                else:
                    print(f"⚠ {db_path} - Database directory not found")
            except Exception as e:
                print(f"✗ {db_path} - Connection failed: {e}")
                
    except ImportError as e:
        print(f"✗ Failed to import database components: {e}")

def main():
    """Run all quick tests."""
    print("="*60)
    print("Quick Tool Test Runner")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("="*60)
    
    test_configuration()
    test_database_connections()
    test_blockfrost_tools()
    test_legal_tools()
    test_knowledge_base_tools()
    test_agents()
    
    print("\n" + "="*60)
    print("Quick tests completed!")
    print("For full system tests, run: python test_agents.py")
    print("="*60)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_type = sys.argv[1].lower()
        
        if test_type == "config":
            test_configuration()
        elif test_type == "db":
            test_database_connections()
        elif test_type == "blockfrost":
            test_blockfrost_tools()
        elif test_type == "legal":
            test_legal_tools()
        elif test_type == "knowledge":
            test_knowledge_base_tools()
        elif test_type == "agents":
            test_agents()
        else:
            print(f"Unknown test type: {test_type}")
            print("Available options: config, db, blockfrost, legal, knowledge, agents")
            sys.exit(1)
    else:
        main()
