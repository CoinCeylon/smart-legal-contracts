# AI Legal & Cardano Blockchain Assistant System

[![Deployed on Azure](https://img.shields.io/badge/Deployed%20on-Azure-0078d4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://calm-cliff-0d11fd610.2.azurestaticapps.net)
[![Cardano](https://img.shields.io/badge/Cardano-Preview%20Testnet-0066cc?style=for-the-badge&logo=cardano&logoColor=white)](https://cardano.org)
[![BlockFrost](https://img.shields.io/badge/BlockFrost-API-00d4aa?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMEwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEwTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=&logoColor=white)](https://blockfrost.io)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)

A comprehensive AI-powered assistant system that combines legal expertise with Cardano blockchain integration. This system provides intelligent assistance for legal queries across multiple domains (Civil Law, Corporate Law, Property Law) and real-time Cardano blockchain data analysis.

## 🏗️ System Architecture

### Core Components

1. **FastAPI Backend** - RESTful API with security middleware and rate limiting
2. **Multi-Agent System** - Specialized AI agents for different domains
3. **Cardano Blockchain Integration** - Real-time data from Cardano network via BlockFrost API
4. **Vector Database** - ChromaDB for semantic search and knowledge retrieval
5. **Legal Knowledge Base** - Specialized legal document processing and search

### Agent Architecture

- **Cardano Agent**: Handles blockchain queries, transaction analysis, and address information
- **Legal Assistant Agent**: Provides expertise in civil, corporate, and property law

## 🚀 Features

### Cardano Blockchain Capabilities
- **Transaction Analysis**: Retrieve and analyze transaction details using transaction hashes
- **Address Information**: Get comprehensive address data including balance and transaction history
- **Transaction Flow Analysis**: Analyze asset flow between addresses with detailed input/output tracking
- **Real-time Data**: Live connection to Cardano Preview Testnet via BlockFrost API
- **CBOR Decoding**: Support for Cardano-specific data formats

### Legal Assistant Capabilities
- **Multi-Domain Expertise**: Civil Law, Corporate Law, Property Law
- **Document Search**: Semantic search across legal documents and precedents
- **Context-Aware Responses**: Intelligent responses based on legal domain context
- **Markdown Formatting**: Web-ready formatted responses

### API Security & Performance
- **Authentication**: Custom security token middleware
- **Rate Limiting**: Configurable request rate limiting
- **CORS Support**: Cross-origin resource sharing for web applications
- **Health Monitoring**: Health check endpoints for system monitoring

## 📁 Project Structure

```
AI-system/
├── app/
│   ├── api/endpoints/          # API route definitions
│   │   ├── query.py           # Cardano blockchain queries
│   │   ├── legal_query.py     # Legal assistance queries
│   │   └── training.py        # Vector database setup
│   ├── core/
│   │   └── config.py          # Environment configuration
│   ├── crud/                  # Business logic layer
│   ├── schemas/               # Pydantic data models
│   └── utils/                 # Utility functions
├── workflow/
│   ├── agents/                # AI agent implementations
│   │   ├── cardano_agent.py   # Cardano blockchain agent
│   │   └── legal_assistant.py # Legal domain agent
│   └── tools/                 # Agent tools and integrations
│       ├── blockfrost_tool.py # Cardano blockchain tools
│       ├── knowledge_base_tool.py # Knowledge search tools
│       └── legal_data_tool.py # Legal document tools
├── data/                      # Raw document storage
│   ├── cardano/              # Cardano documentation
│   ├── civil_law/            # Civil law documents
│   ├── corporate_law/        # Corporate law documents
│   └── property_law/         # Property law documents
├── db/                       # Vector database storage
└── test/                     # Testing and development scripts
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10+
- OpenAI API Key
- BlockFrost API Key (Cardano)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Cardano-AI-system
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key
BLOCKFROST_PROJECT_ID=your_blockfrost_project_id
BLOCKFROST_BASE_URL=https://cardano-preview.blockfrost.io/api/v0
CHROMA_DB_PATH=./chroma_data
```

4. **Setup Vector Databases**
```bash
# Start the FastAPI server
uvicorn app.main:app --reload

# Setup all knowledge bases (one-time setup)
curl -X GET "http://localhost:8000/training/setup_all_vector_dbs" \
     -H "Secret-token: unihack25"
```

### Docker Deployment

```bash
# Build the Docker image
docker build -t ai-legal-cardano-system .

# Run the container
docker run -p 8000:8000 --env-file .env ai-legal-cardano-system
```

## 📚 API Documentation

### Authentication
All API endpoints require a security token header:
```
Secret-token: unihack25
```

### Core Endpoints

#### Cardano Blockchain Queries
```http
POST /query/
Content-Type: application/json

{
  "thread_id": 1,
  "user_input": "What is the balance of addr_test1wryf65umuw5nuh8m4sjh9dka0mx7pwsmle0uyex8pf7f4ycj7y6tp?",
  "lang": "en"
}
```

#### Legal Assistance Queries
```http
POST /legalquery/
Content-Type: application/json

{
  "thread_id": 1,
  "domain": "corporate_law",
  "user_input": "What are the requirements for company registration?",
  "lang": "en"
}
```

#### Vector Database Setup
```http
GET /training/setup_cardano_vector_db
GET /training/setup_civil_law_vector_db
GET /training/setup_corporate_law_vector_db
GET /training/setup_property_law_vector_db
GET /training/setup_all_vector_dbs
```

### Available Tools

#### Cardano Tools
- `get_address_details(address)` - Get comprehensive address information
- `get_transactions_for_address(address)` - Retrieve transaction history
- `get_single_transaction_details(tx_hash)` - Detailed transaction analysis
- `search_cardano_knowledge(query)` - Search Cardano documentation

#### Legal Tools
- `search_civil_law_knowledge(query)` - Civil law document search
- `search_corporate_law_knowledge(query)` - Corporate law expertise
- `search_legal_property_law_knowledge(query)` - Property law assistance

## 🔧 Usage Examples

### Cardano Blockchain Queries

**Transaction Analysis:**
```
"Analyze transaction 4bcba01d2c775b545c783bbd49a9443bb0ac071c743c86eeddd6a814852288e5"
```

**Address Information:**
```
"What is the current balance and transaction history for addr_test1wryf65umuw5nuh8m4sjh9dka0mx7pwsmle0uyex8pf7f4ycj7y6tp?"
```

**General Cardano Questions:**
```
"How does Cardano's proof-of-stake consensus work?"
```

### Legal Assistance Queries

**Corporate Law:**
```
Domain: "corporate_law"
Query: "What are the legal requirements for forming a corporation?"
```

**Property Law:**
```
Domain: "property_law"
Query: "What are the steps involved in property transfer?"
```

**Civil Law:**
```
Domain: "civil_law"
Query: "What constitutes a valid contract under civil law?"
```

## 🧪 Development & Testing

### Running Tests
```bash
# Run the test script for Cardano integration
python test/blockFrostApi.py

# Run the agent test
python test/agent.py
```

### Development Mode
```bash
# Start with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Adding New Legal Documents
1. Place PDF documents in the appropriate `data/` subdirectory
2. Run the corresponding vector database setup endpoint
3. The system will automatically process and index the documents

## 🔐 Security Features

- **Token-based Authentication**: Custom middleware for API security
- **Rate Limiting**: Configurable request throttling
- **CORS Configuration**: Secure cross-origin request handling
- **Input Validation**: Pydantic schema validation for all requests

## 🌐 Integration Capabilities

### Cardano Network
- **BlockFrost API**: Production-ready Cardano data access
- **Preview Testnet**: Safe testing environment
- **Real-time Data**: Live blockchain information
- **CBOR Support**: Native Cardano data format handling

### AI/ML Stack
- **LangChain**: Advanced agent orchestration
- **OpenAI GPT-4**: High-quality language understanding
- **ChromaDB**: Efficient vector similarity search
- **Embeddings**: Semantic document understanding

## 📊 Monitoring & Health

```http
GET /health
```

Returns system health status and availability.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add appropriate tests
5. Submit a pull request

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🚨 Important Notes

- **Testnet Usage**: Currently configured for Cardano Preview Testnet
- **API Keys**: Ensure proper security for API keys in production
- **Rate Limits**: Respect BlockFrost API rate limitations
- **Legal Disclaimer**: This system provides informational assistance only, not legal advice

## 🆘 Support

For technical support or questions:
1. Check the API documentation at `/docs` when the server is running
2. Review the logs for debugging information
3. Ensure all environment variables are properly configured
4. Verify vector databases are properly initialized

---

**Built for UniHack 2025 Organized by [CoinCeylon](https://coinceylon.com/)** - An intelligent assistant system combining legal expertise with blockchain technology.