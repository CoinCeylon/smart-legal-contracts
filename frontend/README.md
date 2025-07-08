# 📋 Lawra - AI-Powered Legal Contract Management Platform

<div align="center">

![Lawra Logo](https://img.shields.io/badge/Lawra-Legal%20Contract%20Platform-blue?style=for-the-badge)

**Streamline your legal workflow with blockchain security, AI assistance, and multi-signature capabilities**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cardano](https://img.shields.io/badge/Cardano-Blockchain-0033AD?logo=cardano&logoColor=white)](https://cardano.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

## 🌟 Overview

Lawra is a revolutionary blockchain-based legal contract management platform that combines traditional legal expertise with cutting-edge technology. Built on the Cardano blockchain, it provides secure, transparent, and efficient contract creation, signing, and management capabilities.

### ✨ Key Features

- 🔐 **Blockchain Security** - Immutable contract storage on Cardano blockchain
- 🤖 **AI-Powered Assistance** - Intelligent contract creation and legal guidance
- ✍️ **Multi-Signature Support** - Coordinate signatures from multiple parties
- 📱 **Wallet Integration** - Cardano wallet-based authentication and signing
- 📄 **Smart Templates** - Pre-built legal templates for common agreements
- 🔍 **Real-Time Tracking** - Monitor contract status and signature progress
- 🌐 **Global Accessibility** - Sign contracts from anywhere in the world
- ⚡ **Lightning Fast** - Process contracts in seconds, not days

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│   Cardano Node  │────│  Backend API    │
│   (This Repo)   │    │   Smart Contract│    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Mesh SDK       │    │  Aiken/Plutus   │    │  Contract Store │
│  Wallet Connect │    │  Validation     │    │  Metadata       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Cardano wallet (Nami, Eternl, etc.)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd slcmp_frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_APP_BACKEND_URL=your_backend_url_here
```

## 🛠️ Tech Stack

### Frontend Framework

- **React 18.3.1** - Modern UI library
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.1** - Lightning-fast build tool

### Styling & UI

- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icons

### Blockchain Integration

- **Mesh SDK 1.9.0** - Cardano blockchain interaction
- **CBOR** - Plutus data serialization
- **Aiken Smart Contracts** - On-chain validation

### State Management & Routing

- **React Router 6.26.2** - Client-side routing
- **TanStack Query 5.56.2** - Server state management
- **React Hook Form 7.53.0** - Form handling

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **Vite Plugin React SWC** - Fast refresh

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── AIAssistantModal.tsx
│   ├── ContractSigningModal.tsx
│   ├── ContractTemplates.tsx
│   ├── Navbar.tsx
│   └── ...
├── contexts/            # React contexts
│   └── UserContext.tsx
├── data/               # Static data files
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── contract.ts     # Blockchain contract logic
│   ├── loadScripts.ts  # Script loading utilities
│   └── utils.ts
├── pages/              # Application pages
│   ├── Index.tsx       # Landing page
│   ├── Dashboard.tsx   # User dashboard
│   ├── CreateContract.tsx
│   ├── AIAssistant.tsx
│   └── ...
└── types/              # TypeScript type definitions
    └── index.ts
```

## 🔧 Smart Contract Integration

The platform uses Cardano smart contracts written in Aiken for secure contract validation:

```typescript
// Contract Datum Structure
interface ContractDatum {
  document_hash: string; // SHA-256 hash of the document
  required_signers: string[]; // List of authorized signers
  signatures_collected: string[]; // Collected signatures
  threshold: number; // Minimum signatures required
  contract_creator: string; // Contract creator's key hash
}
```

### Contract Operations

1. **Create Contract** - Deploy new contract to blockchain
2. **Sign Contract** - Add signature to existing contract
3. **Validate Signatures** - Check signature completeness
4. **Track Status** - Monitor contract progress

## 🤖 AI Features

### Legal Assistant

- **Domain-Specific Guidance** - Property, Civil, Corporate law
- **Contract Templates** - Sri Lankan law compliant templates
- **Document Review** - AI-powered contract analysis
- **Legal Advice** - Contextual legal guidance

### Cardano Assistant

- **Blockchain Support** - Technical blockchain guidance
- **Wallet Help** - Connection and transaction assistance
- **Smart Contract Info** - Contract status and details

## 🐳 Docker Support

### Development

```bash
# Run development container
docker-compose --profile dev up frontend-dev
```

### Production

```bash
# Build and run production container
docker-compose up frontend
```

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔐 Security Features

- **Blockchain Immutability** - Tamper-proof contract storage
- **Multi-Signature Validation** - Cryptographic signature verification
- **Wallet-Based Authentication** - Secure identity verification
- **Document Hashing** - SHA-256 integrity checking
- **Smart Contract Validation** - On-chain business logic

## 🌍 Supported Contract Types

- Employment Agreements
- Service Agreements
- Non-Disclosure Agreements
- Partnership Agreements
- Lease Agreements
- Purchase Agreements
- Loan Agreements
- Consulting Agreements
- License Agreements

## 🎯 Use Cases

### Business

- Partnership agreements
- Vendor contracts
- Service agreements
- Commercial leases

### Legal

- Employment contracts
- NDAs and confidentiality
- Property agreements
- Client engagements

### Industries

- **Civil Law** - Personal disputes, family matters
- **Property Law** - Real estate transactions
- **Corporate Law** - Business contracts, partnerships

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cardano Foundation** - For the blockchain infrastructure
- **Mesh SDK** - For Cardano integration tools
- **shadcn/ui** - For the beautiful component library
- **Aiken** - For smart contract development tools

## 📞 Support

Need help? Check out our resources:

- 📚 [Documentation](./docs)
- 💬 [Discord Community](#)
- 🐛 [Issue Tracker](./issues)
- 📧 [Contact Support](#)

---

<div align="center">

**Built with ❤️ for the future of digital contracts**

[Website](#) • [Documentation](#) • [API](#) • [Community](#)

</div>
