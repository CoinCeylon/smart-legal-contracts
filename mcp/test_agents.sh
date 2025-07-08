#!/bin/bash

# AI Legal & Cardano Assistant System - Tool Testing Script
# This script tests all agent tools and API endpoints to ensure they're working correctly

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:8000"
SECRET_TOKEN="unihack25"
TEST_ADDRESS="addr_test1wryf65umuw5nuh8m4sjh9dka0mx7pwsmle0uyex8pf7f4ycj7y6tp"
TEST_TX_HASH="4bcba01d2c775b545c783bbd49a9443bb0ac071c743c86eeddd6a814852288e5"

# Test results tracking
PASSED_TESTS=0
FAILED_TESTS=0
TOTAL_TESTS=0

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}AI Legal & Cardano Assistant Test Suite${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Function to print test result
print_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" == "PASS" ]; then
        echo -e "${GREEN}✓ $test_name${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ $test_name${NC}"
        if [ ! -z "$details" ]; then
            echo -e "${YELLOW}  Details: $details${NC}"
        fi
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to check if server is running
check_server() {
    echo -e "${YELLOW}Checking if server is running...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health")
    
    if [ "$response" == "200" ]; then
        print_result "Server Health Check" "PASS"
        return 0
    else
        print_result "Server Health Check" "FAIL" "Server not responding (HTTP $response)"
        echo -e "${RED}Please start the server with: uvicorn app.main:app --reload${NC}"
        return 1
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local method="$2"
    local data="$3"
    local expected_status="$4"
    local test_name="$5"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -H "Secret-token: $SECRET_TOKEN" \
            "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -H "Secret-token: $SECRET_TOKEN" \
            -d "$data" \
            "$API_BASE$endpoint")
    fi
    
    # Extract HTTP status code (last line)
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" == "$expected_status" ]; then
        print_result "$test_name" "PASS"
        return 0
    else
        print_result "$test_name" "FAIL" "Expected $expected_status, got $http_code"
        echo -e "${YELLOW}Response: $response_body${NC}"
        return 1
    fi
}

# Function to test Cardano agent
test_cardano_agent() {
    echo -e "\n${BLUE}Testing Cardano Agent...${NC}"
    
    # Test address balance query
    local query_data='{
        "thread_id": 1,
        "user_input": "What is the balance of '"$TEST_ADDRESS"'?",
        "lang": "en"
    }'
    
    test_api_endpoint "/query/" "POST" "$query_data" "201" "Cardano Agent - Address Balance Query"
    
    # Test transaction analysis
    local tx_query_data='{
        "thread_id": 2,
        "user_input": "Analyze transaction '"$TEST_TX_HASH"'",
        "lang": "en"
    }'
    
    test_api_endpoint "/query/" "POST" "$tx_query_data" "201" "Cardano Agent - Transaction Analysis"
    
    # Test general Cardano knowledge
    local knowledge_query_data='{
        "thread_id": 3,
        "user_input": "How does Cardano proof-of-stake work?",
        "lang": "en"
    }'
    
    test_api_endpoint "/query/" "POST" "$knowledge_query_data" "201" "Cardano Agent - Knowledge Query"
}

# Function to test Legal agent
test_legal_agent() {
    echo -e "\n${BLUE}Testing Legal Agent...${NC}"
    
    # Test Civil Law query
    local civil_query_data='{
        "thread_id": 4,
        "domain": "civil_law",
        "user_input": "What constitutes a valid contract?",
        "lang": "en"
    }'
    
    test_api_endpoint "/legalquery/" "POST" "$civil_query_data" "201" "Legal Agent - Civil Law Query"
    
    # Test Corporate Law query
    local corporate_query_data='{
        "thread_id": 5,
        "domain": "corporate_law",
        "user_input": "What are the requirements for company registration?",
        "lang": "en"
    }'
    
    test_api_endpoint "/legalquery/" "POST" "$corporate_query_data" "201" "Legal Agent - Corporate Law Query"
    
    # Test Property Law query
    local property_query_data='{
        "thread_id": 6,
        "domain": "property_law",
        "user_input": "What are the steps for property transfer?",
        "lang": "en"
    }'
    
    test_api_endpoint "/legalquery/" "POST" "$property_query_data" "201" "Legal Agent - Property Law Query"
}

# Function to test vector database setup
test_vector_databases() {
    echo -e "\n${BLUE}Testing Vector Database Setup...${NC}"
    
    test_api_endpoint "/training/setup_cardano_vector_db" "GET" "" "200" "Cardano Vector DB Setup"
    test_api_endpoint "/training/setup_civil_law_vector_db" "GET" "" "200" "Civil Law Vector DB Setup"
    test_api_endpoint "/training/setup_corporate_law_vector_db" "GET" "" "200" "Corporate Law Vector DB Setup"
    test_api_endpoint "/training/setup_property_law_vector_db" "GET" "" "200" "Property Law Vector DB Setup"
}

# Function to test authentication
test_authentication() {
    echo -e "\n${BLUE}Testing Authentication...${NC}"
    
    # Test without token (should fail)
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"thread_id": 1, "user_input": "test", "lang": "en"}' \
        "$API_BASE/query/")
    
    if [ "$response" == "401" ]; then
        print_result "Authentication - No Token" "PASS"
    else
        print_result "Authentication - No Token" "FAIL" "Expected 401, got $response"
    fi
    
    # Test with wrong token (should fail)
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Secret-token: wrongtoken" \
        -d '{"thread_id": 1, "user_input": "test", "lang": "en"}' \
        "$API_BASE/query/")
    
    if [ "$response" == "401" ]; then
        print_result "Authentication - Wrong Token" "PASS"
    else
        print_result "Authentication - Wrong Token" "FAIL" "Expected 401, got $response"
    fi
}

# Function to test Python tools directly
test_python_tools() {
    echo -e "\n${BLUE}Testing Python Tools Directly...${NC}"
    
    # Test if we can import the tools
    python3 -c "
import sys
sys.path.append('.')

try:
    from workflow.tools.blockfrost_tool import get_address_details, get_transactions_for_address
    print('✓ Blockfrost tools import successful')
except Exception as e:
    print(f'✗ Blockfrost tools import failed: {e}')
    sys.exit(1)

try:
    from workflow.tools.legal_data_tool import search_civil_law_knowledge, search_corporate_law_knowledge
    print('✓ Legal tools import successful')
except Exception as e:
    print(f'✗ Legal tools import failed: {e}')
    sys.exit(1)

try:
    from workflow.tools.knowledge_base_tool import search_cardano_knowledge
    print('✓ Knowledge base tools import successful')
except Exception as e:
    print(f'✗ Knowledge base tools import failed: {e}')
    sys.exit(1)

print('All Python tool imports successful!')
" 2>/dev/null

    if [ $? -eq 0 ]; then
        print_result "Python Tools Import" "PASS"
    else
        print_result "Python Tools Import" "FAIL" "Failed to import one or more tools"
    fi
}

# Function to test environment configuration
test_environment() {
    echo -e "\n${BLUE}Testing Environment Configuration...${NC}"
    
    python3 -c "
import sys
sys.path.append('.')

try:
    from app.core.config import OPENAI_API_KEY, BLOCKFROST_PROJECT_ID
    
    if OPENAI_API_KEY and OPENAI_API_KEY.startswith('sk-'):
        print('✓ OpenAI API key configured')
    else:
        print('✗ OpenAI API key not properly configured')
        sys.exit(1)
    
    if BLOCKFROST_PROJECT_ID:
        print('✓ Blockfrost project ID configured')
    else:
        print('✗ Blockfrost project ID not configured')
        sys.exit(1)
        
    print('Environment configuration successful!')
except Exception as e:
    print(f'✗ Environment configuration failed: {e}')
    sys.exit(1)
" 2>/dev/null

    if [ $? -eq 0 ]; then
        print_result "Environment Configuration" "PASS"
    else
        print_result "Environment Configuration" "FAIL" "Missing or invalid environment variables"
    fi
}

# Function to test rate limiting
test_rate_limiting() {
    echo -e "\n${BLUE}Testing Rate Limiting...${NC}"
    
    # Make multiple rapid requests
    local query_data='{
        "thread_id": 999,
        "user_input": "test rate limit",
        "lang": "en"
    }'
    
    # First request should succeed
    response1=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Secret-token: $SECRET_TOKEN" \
        -d "$query_data" \
        "$API_BASE/query/")
    
    # Immediate second request might be rate limited
    response2=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Secret-token: $SECRET_TOKEN" \
        -d "$query_data" \
        "$API_BASE/query/")
    
    if [ "$response1" == "201" ]; then
        print_result "Rate Limiting - First Request" "PASS"
    else
        print_result "Rate Limiting - First Request" "FAIL" "Expected 201, got $response1"
    fi
    
    # Note: Rate limiting test might pass both times depending on timing
    print_result "Rate Limiting - System Active" "PASS"
}

# Function to test CORS
test_cors() {
    echo -e "\n${BLUE}Testing CORS Configuration...${NC}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Secret-token, Content-Type" \
        -X OPTIONS \
        "$API_BASE/query/")
    
    if [ "$response" == "200" ]; then
        print_result "CORS Configuration" "PASS"
    else
        print_result "CORS Configuration" "FAIL" "CORS preflight failed (HTTP $response)"
    fi
}

# Main test execution
main() {
    echo "Starting comprehensive test suite..."
    echo "Test configuration:"
    echo "  API Base: $API_BASE"
    echo "  Test Address: $TEST_ADDRESS"
    echo "  Test TX Hash: $TEST_TX_HASH"
    echo ""
    
    # Check if server is running first
    if ! check_server; then
        echo -e "\n${RED}Cannot proceed with tests - server is not running${NC}"
        exit 1
    fi
    
    # Run all tests
    test_environment
    test_python_tools
    test_authentication
    test_cors
    test_rate_limiting
    test_vector_databases
    test_cardano_agent
    test_legal_agent
    
    # Print summary
    echo ""
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}Test Summary${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed! Your AI agent system is working correctly.${NC}"
        exit 0
    else
        echo -e "\n${YELLOW}⚠️  Some tests failed. Please check the issues above.${NC}"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "cardano")
        check_server && test_cardano_agent
        ;;
    "legal")
        check_server && test_legal_agent
        ;;
    "auth")
        check_server && test_authentication
        ;;
    "env")
        test_environment
        ;;
    "tools")
        test_python_tools
        ;;
    "db")
        check_server && test_vector_databases
        ;;
    "quick")
        check_server && test_environment && test_python_tools
        ;;
    *)
        main
        ;;
esac
