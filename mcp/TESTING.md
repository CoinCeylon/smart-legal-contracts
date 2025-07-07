# Testing Guide for AI Legal & Cardano Assistant System

This directory contains comprehensive testing scripts to verify that all components of the AI agent system are working correctly.

## Testing Scripts Overview

### 1. `test_agents.py` - Comprehensive Test Suite (Recommended)
**Platform**: Cross-platform Python script
**Purpose**: Complete end-to-end testing of all system components

```bash
# Run all tests
python test_agents.py

# Run specific test categories
python test_agents.py cardano    # Test Cardano agent only
python test_agents.py legal     # Test Legal agent only
python test_agents.py auth      # Test authentication only
python test_agents.py env       # Test environment config only
python test_agents.py tools     # Test Python tools import only
python test_agents.py db        # Test vector databases only
python test_agents.py quick     # Quick environment + tools test
```

### 2. `quick_test.py` - Individual Component Testing
**Platform**: Cross-platform Python script
**Purpose**: Test individual tools and components without API calls

```bash
# Run all quick tests
python quick_test.py

# Test specific components
python quick_test.py config      # Test configuration loading
python quick_test.py db          # Test database connections
python quick_test.py blockfrost  # Test BlockFrost tools
python quick_test.py legal       # Test legal tools
python quick_test.py knowledge   # Test knowledge base tools
python quick_test.py agents      # Test agent initialization
```

### 3. `test_agents.sh` - Linux/Mac Bash Script
**Platform**: Linux/macOS
**Purpose**: Shell-based testing with curl commands

```bash
# Make executable and run
chmod +x test_agents.sh
./test_agents.sh

# Run specific tests
./test_agents.sh cardano
./test_agents.sh legal
./test_agents.sh quick
```

### 4. `test_agents.bat` - Windows Batch Script
**Platform**: Windows
**Purpose**: Windows batch testing with curl commands

```cmd
# Run all tests
test_agents.bat

# Run specific tests
test_agents.bat cardano
test_agents.bat legal
test_agents.bat quick
```

## Prerequisites

### 1. Environment Setup
Ensure these environment variables are set in your `.env` file:
```env
OPENAI_API_KEY=sk-your-openai-api-key
BLOCKFROST_PROJECT_ID=your-blockfrost-project-id
BLOCKFROST_BASE_URL=https://cardano-preview.blockfrost.io/api/v0
```

### 2. Dependencies
Install required packages:
```bash
pip install -r requirements.txt
```

### 3. Server Running
Start the FastAPI server before running tests:
```bash
uvicorn app.main:app --reload
```

### 4. Vector Databases (Optional)
Setup vector databases for full functionality:
```bash
curl -X GET "http://localhost:8000/training/setup_all_vector_dbs" \
     -H "Secret-token: unihack25"
```

## Test Categories

### 1. Server Health Tests
- ✅ Server availability check
- ✅ Health endpoint response
- ✅ Basic connectivity

### 2. Environment Configuration Tests
- ✅ OpenAI API key validation
- ✅ BlockFrost project ID check
- ✅ Configuration loading
- ✅ Model settings verification

### 3. Authentication Tests
- ✅ No token rejection (401)
- ✅ Wrong token rejection (401)
- ✅ Valid token acceptance (200/201)
- ✅ Security middleware functionality

### 4. Python Tools Import Tests
- ✅ BlockFrost tools import
- ✅ Legal data tools import
- ✅ Knowledge base tools import
- ✅ Agent class imports

### 5. Database Connection Tests
- ✅ ChromaDB connections
- ✅ Vector store initialization
- ✅ Embeddings functionality
- ✅ Database directory checks

### 6. API Endpoint Tests
- ✅ Cardano query endpoint (`/query/`)
- ✅ Legal query endpoint (`/legalquery/`)
- ✅ Training endpoints (`/training/*`)
- ✅ CORS configuration
- ✅ Rate limiting

### 7. Cardano Agent Tests
- ✅ Address balance queries
- ✅ Transaction analysis
- ✅ BlockFrost API integration
- ✅ Cardano knowledge base search

### 8. Legal Agent Tests
- ✅ Civil law queries
- ✅ Corporate law queries
- ✅ Property law queries
- ✅ Legal document search

### 9. Vector Database Tests
- ✅ Database setup endpoints
- ✅ Document indexing
- ✅ Semantic search functionality
- ✅ Knowledge retrieval

## Test Data

### Default Test Values
- **Test Address**: `addr_test1wryf65umuw5nuh8m4sjh9dka0mx7pwsmle0uyex8pf7f4ycj7y6tp`
- **Test Transaction**: `4bcba01d2c775b545c783bbd49a9443bb0ac071c743c86eeddd6a814852288e5`
- **API Base**: `http://localhost:8000`
- **Secret Token**: `unihack25`

### Sample Queries
**Cardano Queries:**
- "What is the balance of [test_address]?"
- "Analyze transaction [test_tx_hash]"
- "How does Cardano proof-of-stake work?"

**Legal Queries:**
- Civil Law: "What constitutes a valid contract?"
- Corporate Law: "What are the requirements for company registration?"
- Property Law: "What are the steps for property transfer?"

## Interpreting Test Results

### Success Indicators
- ✅ Green checkmarks indicate passing tests
- HTTP 200/201 responses for valid requests
- HTTP 401 responses for authentication tests
- Successful tool imports and database connections

### Failure Indicators
- ✗ Red X marks indicate failing tests
- Connection errors suggest server issues
- Import errors suggest missing dependencies
- 500 errors suggest configuration problems

### Common Issues and Solutions

**Server Not Running**
```
Solution: Start the server with `uvicorn app.main:app --reload`
```

**Environment Variables Missing**
```
Solution: Check .env file and ensure all required variables are set
```

**Database Connection Errors**
```
Solution: Run vector database setup endpoints first
```

**Import Errors**
```
Solution: Install requirements with `pip install -r requirements.txt`
```

**API Key Issues**
```
Solution: Verify OpenAI and BlockFrost API keys are valid
```

## Continuous Testing

### Pre-deployment Checklist
1. ✅ Run `python test_agents.py` and ensure all tests pass
2. ✅ Verify environment configuration
3. ✅ Check vector databases are initialized
4. ✅ Test with sample queries
5. ✅ Verify authentication is working

### Development Workflow
1. Make code changes
2. Run `python quick_test.py` for rapid feedback
3. Run specific test category if needed
4. Run full test suite before commits
5. Monitor test results and fix issues

### Automated Testing
Consider integrating these tests into your CI/CD pipeline:
```yaml
# Example GitHub Actions step
- name: Run Agent Tests
  run: |
    python test_agents.py
    python quick_test.py
```

## Test Results

Test results are automatically saved to `test_results.json` with:
- Timestamp of test run
- Summary statistics
- Individual test results
- Error details for debugging

## Getting Help

If tests are failing:
1. Check the server logs for detailed error messages
2. Verify all prerequisites are met
3. Run individual test categories to isolate issues
4. Check the test results JSON file for detailed error information
5. Ensure all environment variables are properly configured

For questions or issues, refer to the main README.md or check the API documentation at `/docs` when the server is running.
