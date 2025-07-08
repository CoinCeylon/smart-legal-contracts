@echo off
setlocal enabledelayedexpansion

REM AI Legal & Cardano Assistant System - Tool Testing Script (Windows)
REM This script tests all agent tools and API endpoints to ensure they're working correctly

REM Configuration
set API_BASE=http://localhost:8000
set SECRET_TOKEN=unihack25
set TEST_ADDRESS=addr_test1wryf65umuw5nuh8m4sjh9dka0mx7pwsmle0uyex8pf7f4ycj7y6tp
set TEST_TX_HASH=4bcba01d2c775b545c783bbd49a9443bb0ac071c743c86eeddd6a814852288e5

REM Test results tracking
set PASSED_TESTS=0
set FAILED_TESTS=0
set TOTAL_TESTS=0

echo ==========================================
echo AI Legal ^& Cardano Assistant Test Suite
echo ==========================================
echo.

REM Function to print test result
:print_result
set test_name=%1
set result=%2
set details=%3

set /a TOTAL_TESTS+=1

if "%result%"=="PASS" (
    echo [92m√ %test_name%[0m
    set /a PASSED_TESTS+=1
) else (
    echo [91m× %test_name%[0m
    if not "%details%"=="" echo   Details: %details%
    set /a FAILED_TESTS+=1
)
goto :eof

REM Check if server is running
:check_server
echo Checking if server is running...

curl -s -o nul -w "%%{http_code}" "%API_BASE%/health" > temp_response.txt
set /p response=<temp_response.txt
del temp_response.txt

if "%response%"=="200" (
    call :print_result "Server Health Check" "PASS"
    exit /b 0
) else (
    call :print_result "Server Health Check" "FAIL" "Server not responding (HTTP %response%)"
    echo Please start the server with: uvicorn app.main:app --reload
    exit /b 1
)

REM Test API endpoint
:test_api_endpoint
set endpoint=%1
set method=%2
set data=%3
set expected_status=%4
set test_name=%5

if "%method%"=="GET" (
    curl -s -w "%%{http_code}" -H "Secret-token: %SECRET_TOKEN%" "%API_BASE%%endpoint%" > temp_response.txt
) else (
    curl -s -w "%%{http_code}" -X %method% -H "Content-Type: application/json" -H "Secret-token: %SECRET_TOKEN%" -d %data% "%API_BASE%%endpoint%" > temp_response.txt
)

REM Extract the last line (HTTP status code)
for /f "tokens=*" %%i in (temp_response.txt) do set last_line=%%i
set http_code=%last_line%
del temp_response.txt

if "%http_code%"=="%expected_status%" (
    call :print_result "%test_name%" "PASS"
    exit /b 0
) else (
    call :print_result "%test_name%" "FAIL" "Expected %expected_status%, got %http_code%"
    exit /b 1
)

REM Test environment configuration
:test_environment
echo.
echo Testing Environment Configuration...

python -c "import sys; sys.path.append('.'); from app.core.config import OPENAI_API_KEY, BLOCKFROST_PROJECT_ID; print('Environment OK' if OPENAI_API_KEY and BLOCKFROST_PROJECT_ID else 'Environment FAIL')" > temp_env.txt 2>nul
set /p env_result=<temp_env.txt
del temp_env.txt

if "%env_result%"=="Environment OK" (
    call :print_result "Environment Configuration" "PASS"
) else (
    call :print_result "Environment Configuration" "FAIL" "Missing environment variables"
)
goto :eof

REM Test Python tools import
:test_python_tools
echo.
echo Testing Python Tools Import...

python -c "import sys; sys.path.append('.'); from workflow.tools.blockfrost_tool import get_address_details; from workflow.tools.legal_data_tool import search_civil_law_knowledge; from workflow.tools.knowledge_base_tool import search_cardano_knowledge; print('Import OK')" > temp_import.txt 2>nul
set /p import_result=<temp_import.txt
del temp_import.txt

if "%import_result%"=="Import OK" (
    call :print_result "Python Tools Import" "PASS"
) else (
    call :print_result "Python Tools Import" "FAIL" "Failed to import tools"
)
goto :eof

REM Test Cardano agent
:test_cardano_agent
echo.
echo Testing Cardano Agent...

REM Test address balance query
set query_data="{\"thread_id\": 1, \"user_input\": \"What is the balance of %TEST_ADDRESS%?\", \"lang\": \"en\"}"
call :test_api_endpoint "/query/" "POST" "%query_data%" "201" "Cardano Agent - Address Balance Query"

REM Test transaction analysis
set tx_query_data="{\"thread_id\": 2, \"user_input\": \"Analyze transaction %TEST_TX_HASH%\", \"lang\": \"en\"}"
call :test_api_endpoint "/query/" "POST" "%tx_query_data%" "201" "Cardano Agent - Transaction Analysis"

REM Test general knowledge
set knowledge_query_data="{\"thread_id\": 3, \"user_input\": \"How does Cardano proof-of-stake work?\", \"lang\": \"en\"}"
call :test_api_endpoint "/query/" "POST" "%knowledge_query_data%" "201" "Cardano Agent - Knowledge Query"
goto :eof

REM Test Legal agent
:test_legal_agent
echo.
echo Testing Legal Agent...

REM Test Civil Law query
set civil_query_data="{\"thread_id\": 4, \"domain\": \"civil_law\", \"user_input\": \"What constitutes a valid contract?\", \"lang\": \"en\"}"
call :test_api_endpoint "/legalquery/" "POST" "%civil_query_data%" "201" "Legal Agent - Civil Law Query"

REM Test Corporate Law query
set corporate_query_data="{\"thread_id\": 5, \"domain\": \"corporate_law\", \"user_input\": \"What are the requirements for company registration?\", \"lang\": \"en\"}"
call :test_api_endpoint "/legalquery/" "POST" "%corporate_query_data%" "201" "Legal Agent - Corporate Law Query"

REM Test Property Law query
set property_query_data="{\"thread_id\": 6, \"domain\": \"property_law\", \"user_input\": \"What are the steps for property transfer?\", \"lang\": \"en\"}"
call :test_api_endpoint "/legalquery/" "POST" "%property_query_data%" "201" "Legal Agent - Property Law Query"
goto :eof

REM Test vector databases
:test_vector_databases
echo.
echo Testing Vector Database Setup...

call :test_api_endpoint "/training/setup_cardano_vector_db" "GET" "" "200" "Cardano Vector DB Setup"
call :test_api_endpoint "/training/setup_civil_law_vector_db" "GET" "" "200" "Civil Law Vector DB Setup"
call :test_api_endpoint "/training/setup_corporate_law_vector_db" "GET" "" "200" "Corporate Law Vector DB Setup"
call :test_api_endpoint "/training/setup_property_law_vector_db" "GET" "" "200" "Property Law Vector DB Setup"
goto :eof

REM Test authentication
:test_authentication
echo.
echo Testing Authentication...

REM Test without token (should fail)
curl -s -o nul -w "%%{http_code}" -X POST -H "Content-Type: application/json" -d "{\"thread_id\": 1, \"user_input\": \"test\", \"lang\": \"en\"}" "%API_BASE%/query/" > temp_auth1.txt
set /p response1=<temp_auth1.txt
del temp_auth1.txt

if "%response1%"=="401" (
    call :print_result "Authentication - No Token" "PASS"
) else (
    call :print_result "Authentication - No Token" "FAIL" "Expected 401, got %response1%"
)

REM Test with wrong token (should fail)
curl -s -o nul -w "%%{http_code}" -X POST -H "Content-Type: application/json" -H "Secret-token: wrongtoken" -d "{\"thread_id\": 1, \"user_input\": \"test\", \"lang\": \"en\"}" "%API_BASE%/query/" > temp_auth2.txt
set /p response2=<temp_auth2.txt
del temp_auth2.txt

if "%response2%"=="401" (
    call :print_result "Authentication - Wrong Token" "PASS"
) else (
    call :print_result "Authentication - Wrong Token" "FAIL" "Expected 401, got %response2%"
)
goto :eof

REM Main test execution
:main
echo Starting comprehensive test suite...
echo Test configuration:
echo   API Base: %API_BASE%
echo   Test Address: %TEST_ADDRESS%
echo   Test TX Hash: %TEST_TX_HASH%
echo.

REM Check if server is running first
call :check_server
if errorlevel 1 (
    echo Cannot proceed with tests - server is not running
    pause
    exit /b 1
)

REM Run all tests
call :test_environment
call :test_python_tools
call :test_authentication
call :test_vector_databases
call :test_cardano_agent
call :test_legal_agent

REM Print summary
echo.
echo ==========================================
echo Test Summary
echo ==========================================
echo Total Tests: %TOTAL_TESTS%
echo Passed: %PASSED_TESTS%
echo Failed: %FAILED_TESTS%

if %FAILED_TESTS%==0 (
    echo.
    echo All tests passed! Your AI agent system is working correctly.
) else (
    echo.
    echo Some tests failed. Please check the issues above.
)

pause
goto :eof

REM Handle script arguments
if "%1"=="cardano" (
    call :check_server && call :test_cardano_agent
) else if "%1"=="legal" (
    call :check_server && call :test_legal_agent
) else if "%1"=="auth" (
    call :check_server && call :test_authentication
) else if "%1"=="env" (
    call :test_environment
) else if "%1"=="tools" (
    call :test_python_tools
) else if "%1"=="db" (
    call :check_server && call :test_vector_databases
) else if "%1"=="quick" (
    call :check_server && call :test_environment && call :test_python_tools
) else (
    call :main
)
