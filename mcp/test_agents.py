#!/usr/bin/env python3
"""
AI Legal & Cardano Assistant System - Comprehensive Test Suite
This script tests all agent tools and API endpoints to ensure they're working correctly.
"""

import requests
import json
import sys
import os
from datetime import datetime
from typing import Dict, Any, Tuple
import importlib.util

# Add current directory to Python path
sys.path.append('.')

# Configuration
API_BASE = "http://localhost:8000"
SECRET_TOKEN = "unihack25"
TEST_ADDRESS = "addr_test1wryf65umuw5nuh8m4sjh9dka0mx7pwsmle0uyex8pf7f4ycj7y6tp"
TEST_TX_HASH = "4bcba01d2c775b545c783bbd49a9443bb0ac071c743c86eeddd6a814852288e5"

# Test results tracking
class TestTracker:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.total = 0
        self.results = []

    def add_result(self, test_name: str, passed: bool, details: str = ""):
        self.total += 1
        if passed:
            self.passed += 1
            print(f"✓ {test_name}")
        else:
            self.failed += 1
            print(f"✗ {test_name}")
            if details:
                print(f"  Details: {details}")
        
        self.results.append({
            'test': test_name,
            'passed': passed,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })

    def print_summary(self):
        print("\n" + "="*50)
        print("Test Summary")
        print("="*50)
        print(f"Total Tests: {self.total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        
        if self.failed == 0:
            print("\n🎉 All tests passed! Your AI agent system is working correctly.")
            return True
        else:
            print("\n⚠️  Some tests failed. Please check the issues above.")
            return False

# Initialize test tracker
tracker = TestTracker()

def get_auth_headers(content_type: bool = False) -> Dict[str, str]:
    """Get standard headers with authentication token."""
    headers = {"Secret-token": SECRET_TOKEN}
    if content_type:
        headers["Content-Type"] = "application/json"
    return headers

def check_server() -> bool:
    """Check if the FastAPI server is running."""
    print("Checking if server is running...")
    try:
        headers = get_auth_headers()
        response = requests.get(f"{API_BASE}/health", headers=headers, timeout=5)
        if response.status_code == 200:
            tracker.add_result("Server Health Check", True)
            return True
        else:
            tracker.add_result("Server Health Check", False, f"HTTP {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        tracker.add_result("Server Health Check", False, f"Connection error: {str(e)}")
        print("Please start the server with: uvicorn app.main:app --reload")
        return False

def test_api_endpoint(endpoint: str, method: str = "GET", data: Dict = None, 
                     expected_status: int = 200, test_name: str = "") -> bool:
    """Test an API endpoint with authentication."""
    headers = get_auth_headers(content_type=(method == "POST"))
    
    try:
        if method == "GET":
            response = requests.get(f"{API_BASE}{endpoint}", headers=headers, timeout=30)
        elif method == "POST":
            response = requests.post(f"{API_BASE}{endpoint}", headers=headers, 
                                   json=data, timeout=30)
        
        if response.status_code == expected_status:
            tracker.add_result(test_name, True)
            return True
        else:
            tracker.add_result(test_name, False, 
                             f"Expected {expected_status}, got {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        tracker.add_result(test_name, False, f"Request error: {str(e)}")
        return False

def test_environment():
    """Test environment configuration."""
    print("\nTesting Environment Configuration...")
    
    try:
        from app.core.config import OPENAI_API_KEY, BLOCKFROST_PROJECT_ID
        
        # Check OpenAI API key
        if OPENAI_API_KEY and OPENAI_API_KEY.startswith('sk-'):
            tracker.add_result("OpenAI API Key Configuration", True)
        else:
            tracker.add_result("OpenAI API Key Configuration", False, 
                             "Missing or invalid OpenAI API key")
        
        # Check Blockfrost project ID
        if BLOCKFROST_PROJECT_ID:
            tracker.add_result("Blockfrost Project ID Configuration", True)
        else:
            tracker.add_result("Blockfrost Project ID Configuration", False, 
                             "Missing Blockfrost project ID")
        
    except ImportError as e:
        tracker.add_result("Environment Configuration", False, f"Import error: {str(e)}")

def test_python_tools():
    """Test Python tool imports."""
    print("\nTesting Python Tools Import...")
    
    tools_to_test = [
        ("workflow.tools.blockfrost_tool", ["get_address_details", "get_transactions_for_address"]),
        ("workflow.tools.legal_data_tool", ["search_civil_law_knowledge", "search_corporate_law_knowledge"]),
        ("workflow.tools.knowledge_base_tool", ["search_cardano_knowledge"])
    ]
    
    for module_name, tool_names in tools_to_test:
        try:
            module = importlib.import_module(module_name)
            for tool_name in tool_names:
                if hasattr(module, tool_name):
                    tracker.add_result(f"Import {module_name}.{tool_name}", True)
                else:
                    tracker.add_result(f"Import {module_name}.{tool_name}", False, 
                                     f"Tool {tool_name} not found")
        except ImportError as e:
            tracker.add_result(f"Import {module_name}", False, f"Import error: {str(e)}")

def test_authentication():
    """Test authentication mechanisms."""
    print("\nTesting Authentication...")
    
    test_data = {"thread_id": 1, "user_input": "test", "lang": "en"}
    
    # Test without token (should fail)
    try:
        response = requests.post(f"{API_BASE}/query/", json=test_data, timeout=10)
        if response.status_code == 401:
            tracker.add_result("Authentication - No Token", True)
        else:
            tracker.add_result("Authentication - No Token", False, 
                             f"Expected 401, got {response.status_code}")
    except requests.exceptions.RequestException as e:
        tracker.add_result("Authentication - No Token", False, f"Request error: {str(e)}")
    
    # Test with wrong token (should fail)
    try:
        headers = {"Secret-token": "wrongtoken", "Content-Type": "application/json"}
        response = requests.post(f"{API_BASE}/query/", headers=headers, 
                               json=test_data, timeout=10)
        if response.status_code == 401:
            tracker.add_result("Authentication - Wrong Token", True)
        else:
            tracker.add_result("Authentication - Wrong Token", False, 
                             f"Expected 401, got {response.status_code}")
    except requests.exceptions.RequestException as e:
        tracker.add_result("Authentication - Wrong Token", False, f"Request error: {str(e)}")
    
    # Test with correct token (should succeed)
    try:
        headers = get_auth_headers(content_type=True)
        response = requests.post(f"{API_BASE}/query/", headers=headers, 
                               json=test_data, timeout=10)
        if response.status_code == 201:
            tracker.add_result("Authentication - Valid Token", True)
        else:
            tracker.add_result("Authentication - Valid Token", False, 
                             f"Expected 201, got {response.status_code}")
    except requests.exceptions.RequestException as e:
        tracker.add_result("Authentication - Valid Token", False, f"Request error: {str(e)}")

def test_cardano_agent():
    """Test Cardano agent functionality."""
    print("\nTesting Cardano Agent...")
    
    # Test address balance query
    query_data = {
        "thread_id": 1,
        "user_input": f"What is the balance of {TEST_ADDRESS}?",
        "lang": "en"
    }
    test_api_endpoint("/query/", "POST", query_data, 201, 
                     "Cardano Agent - Address Balance Query")
    
    # Test transaction analysis
    tx_query_data = {
        "thread_id": 2,
        "user_input": f"Analyze transaction {TEST_TX_HASH}",
        "lang": "en"
    }
    test_api_endpoint("/query/", "POST", tx_query_data, 201, 
                     "Cardano Agent - Transaction Analysis")
    
    # Test general Cardano knowledge
    knowledge_query_data = {
        "thread_id": 3,
        "user_input": "How does Cardano proof-of-stake work?",
        "lang": "en"
    }
    test_api_endpoint("/query/", "POST", knowledge_query_data, 201, 
                     "Cardano Agent - Knowledge Query")

def test_legal_agent():
    """Test Legal agent functionality."""
    print("\nTesting Legal Agent...")
    
    # Test Civil Law query
    civil_query_data = {
        "thread_id": 4,
        "domain": "civil_law",
        "user_input": "What constitutes a valid contract?",
        "lang": "en"
    }
    test_api_endpoint("/legalquery/", "POST", civil_query_data, 201, 
                     "Legal Agent - Civil Law Query")
    
    # Test Corporate Law query
    corporate_query_data = {
        "thread_id": 5,
        "domain": "corporate_law",
        "user_input": "What are the requirements for company registration?",
        "lang": "en"
    }
    test_api_endpoint("/legalquery/", "POST", corporate_query_data, 201, 
                     "Legal Agent - Corporate Law Query")
    
    # Test Property Law query
    property_query_data = {
        "thread_id": 6,
        "domain": "property_law",
        "user_input": "What are the steps for property transfer?",
        "lang": "en"
    }
    test_api_endpoint("/legalquery/", "POST", property_query_data, 201, 
                     "Legal Agent - Property Law Query")

def test_vector_databases():
    """Test vector database setup."""
    print("\nTesting Vector Database Setup...")
    
    test_api_endpoint("/training/setup_cardano_vector_db", "GET", None, 200, 
                     "Cardano Vector DB Setup")
    test_api_endpoint("/training/setup_civil_law_vector_db", "GET", None, 200, 
                     "Civil Law Vector DB Setup")
    test_api_endpoint("/training/setup_corporate_law_vector_db", "GET", None, 200, 
                     "Corporate Law Vector DB Setup")
    test_api_endpoint("/training/setup_property_law_vector_db", "GET", None, 200, 
                     "Property Law Vector DB Setup")

def test_cors():
    """Test CORS configuration."""
    print("\nTesting CORS Configuration...")
    
    try:
        headers = {
            "Secret-token": SECRET_TOKEN,
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Secret-token, Content-Type"
        }
        response = requests.options(f"{API_BASE}/query/", headers=headers, timeout=10)
        
        if response.status_code == 200:
            tracker.add_result("CORS Configuration", True)
        else:
            tracker.add_result("CORS Configuration", False, 
                             f"CORS preflight failed (HTTP {response.status_code})")
    except requests.exceptions.RequestException as e:
        tracker.add_result("CORS Configuration", False, f"Request error: {str(e)}")

def save_test_results():
    """Save test results to a file."""
    results = {
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total': tracker.total,
            'passed': tracker.passed,
            'failed': tracker.failed
        },
        'tests': tracker.results
    }
    
    with open('test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nTest results saved to test_results.json")

def main():
    """Main test execution."""
    print("="*50)
    print("AI Legal & Cardano Assistant Test Suite")
    print("="*50)
    print(f"Test configuration:")
    print(f"  API Base: {API_BASE}")
    print(f"  Test Address: {TEST_ADDRESS}")
    print(f"  Test TX Hash: {TEST_TX_HASH}")
    print()
    
    # Check if server is running first
    if not check_server():
        print("\nCannot proceed with tests - server is not running")
        return False
    
    # Run all tests
    test_environment()
    test_python_tools()
    test_authentication()
    test_cors()
    test_vector_databases()
    test_cardano_agent()
    test_legal_agent()
    
    # Print summary and save results
    success = tracker.print_summary()
    save_test_results()
    
    return success

if __name__ == "__main__":
    # Handle command line arguments
    if len(sys.argv) > 1:
        test_type = sys.argv[1].lower()
        
        if not check_server() and test_type not in ['env', 'tools']:
            print("Server not running - can only run 'env' or 'tools' tests")
            sys.exit(1)
        
        if test_type == "cardano":
            test_cardano_agent()
        elif test_type == "legal":
            test_legal_agent()
        elif test_type == "auth":
            test_authentication()
        elif test_type == "env":
            test_environment()
        elif test_type == "tools":
            test_python_tools()
        elif test_type == "db":
            test_vector_databases()
        elif test_type == "quick":
            test_environment()
            test_python_tools()
        else:
            print(f"Unknown test type: {test_type}")
            print("Available options: cardano, legal, auth, env, tools, db, quick")
            sys.exit(1)
        
        tracker.print_summary()
    else:
        success = main()
        sys.exit(0 if success else 1)
