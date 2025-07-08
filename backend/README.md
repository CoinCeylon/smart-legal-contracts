# 📋 Lawra - AI-Powered Legal Contract Management Platform

<div align="center">

![Lawra Logo](https://img.shields.io/badge/Lawra-Legal%20Contract%20Platform-blue?style=for-the-badge)

**Streamline your legal workflow with blockchain security, AI assistance, and multi-signature capabilities**

<p align="center">
<img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
<img src="https://img.shields.io/badge/TypeScript-API-3178C6?logo=typescript&logoColor=white&style=for-the-badge" alt="TypeScript">
<img src="https://img.shields.io/badge/PostgreSQL-DB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>
</div>

## 🌟 Overview

A secure backend API for managing smart contracts, digital signatures, and blockchain-based document verification. This system allows users to create, sign, and manage contracts with blockchain integration.

## 🚀 What This Project Does

- **👤 User Management**: Register, login, and manage user accounts
- **📄 Contract Creation**: Upload and create digital contracts
- **✍️ Digital Signatures**: Sign contracts using blockchain technology
- **📧 Email Notifications**: Send contract invitations and QR codes
- **🔐 Security**: Secure authentication and data protection
- **🌐 Blockchain Integration**: Connect with Web3 wallets for verification

## 📋 What You Need Before Starting

- **Node.js** (version 18 or newer) - [Download here](https://nodejs.org/)
- **PostgreSQL** (version 12 or newer) - [Download here](https://www.postgresql.org/download/)
- **Gmail account** (for sending emails)
- **Code editor** (VS Code recommended)

## 🛠️ Easy Setup Guide

> **💡 Tip**: Take your time with each step. If you get stuck, check the troubleshooting section at the bottom.

### Step 1: Get the Code 📥

```bash
# Download the project
git clone <your-repository-url>
cd unihack25-backend

# Install all the packages we need
npm install
```

### Step 2: Set Up Your Database 🗄️

**Option A: Quick Setup (Recommended)**

```bash
# Install PostgreSQL (choose your system):

# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
# Windows: Should start automatically
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

**Create your database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create a new user and database
CREATE USER unihack_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE unihack25_db OWNER unihack_user;

# Exit PostgreSQL
\q
```

### Step 3: Configure Your Environment 🔧

Create a `.env` file in your project folder and add these settings:

```env
# Database connection
DATABASE_URL="postgresql://unihack_user:your_secure_password@localhost:5432/unihack25_db"

# Security key (make this random and long)
JWT_SECRET="your-super-secret-key-that-is-at-least-32-characters-long"

# Server settings
PORT=3100

# Email settings (for Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

**� How to get Gmail App Password:**

1. Go to your Google Account settings
2. Turn on 2-Factor Authentication
3. Go to Security → App passwords
4. Generate a password for "Mail"
5. Use this password in `SMTP_PASSWORD` (not your regular Gmail password)

### Step 4: Set Up the Database Tables 🏗️

```bash
# Create the database structure
npm run db:generate
npm run db:migrate

# If asked for a migration name, just type: "initial_setup"
```

### Step 5: Test Everything Works ✅

```bash
# Start the server
npm run dev

# You should see messages like:
# "Server is listening on 3100"
# "database connected successfully"
```

**Test your API:**

```bash
# Open a new terminal and test:
curl http://localhost:3100/healthz

# You should get a response like:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

### Step 6: You're Ready! 🎉

Your API is now running at `http://localhost:3100`

**Quick test - Create a user:**

```bash
# Register a new user
curl -X POST http://localhost:3100/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## 🚀 How to Use the API

### Main Endpoints

**User Registration:**

```http
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Login:**

```http
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Create Contract (requires login token):**

```http
POST /api/v1/contracts
Authorization: Bearer <your-token>
[Upload PDF file with contract details]
```

**Sign Contract:**

```http
PUT /api/v1/contracts/{id}/sign
Authorization: Bearer <your-token>
{
  "transactionHash": "0x...",
  "walletAddress": "0x..."
}
```

## 🔒 Security Features

- **🔐 Password Protection**: All passwords are securely encrypted
- **🎫 Login Tokens**: Secure JWT tokens for authentication
- **💾 Safe Database**: SQL injection protection
- **📁 File Security**: Secure file uploads (max 10MB)
- **🌐 Blockchain Verification**: Wallet and transaction verification
- **📧 Email Security**: Secure email notifications

## 🛠️ Development Commands

```bash
# Start development server (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database (opens in browser)
npm run db:studio

# Update database structure
npm run db:migrate
```

## 📁 Project Structure

```
unihack25-backend/
├── src/
│   ├── api/v1/          # API endpoints
│   ├── services/        # Business logic
│   ├── config/          # Configuration
│   └── types/           # TypeScript types
├── prisma/              # Database schema
├── package.json         # Dependencies
├── .env                 # Your settings (create this)
└── README.md           # This file
```

## 🧪 Testing Your Setup

### Quick Health Check

```bash
# Make sure your server is running
curl http://localhost:3100/healthz

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-07-08T12:00:00.000Z"
}
```

### Test User Registration

```bash
# Create a test user
curl -X POST http://localhost:3100/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'
```

### Test Login

```bash
# Login with your test user
curl -X POST http://localhost:3100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

## 🐳 Docker Setup (Optional)

If you prefer using Docker:

1. Create a `docker-compose.yml` file:

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: unihack25_db
      POSTGRES_USER: unihack_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3100:3100"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://unihack_user:your_password@postgres:5432/unihack25_db
      JWT_SECRET: your-secret-key
      SMTP_USER: your-email@gmail.com
      SMTP_PASSWORD: your-app-password
```

2. Run with Docker:

```bash
docker-compose up -d
```

## 🛟 Common Problems & Solutions

### ❌ "Database connection failed"

**Fix:**

1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in .env
3. Verify database user and password are correct

### ❌ "JWT_SECRET too short"

**Fix:**

```bash
# Generate a long random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the result to JWT_SECRET in .env
```

### ❌ "Email not sending"

**Fix:**

1. Use Gmail App Password (not regular password)
2. Enable 2-Factor Authentication on Gmail first
3. Check SMTP settings are correct

### ❌ "Port already in use"

**Fix:**
Change PORT=3001 in your .env file

### ❌ "npm install fails"

**Fix:**

```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🔧 Development Tips

- **View Database**: Run `npm run db:studio` to see your data in a web interface
- **Auto-reload**: Use `npm run dev` for development with automatic restarts
- **Check Logs**: Look at the console output for error messages
- **Environment**: Make sure your .env file is in the project root folder

## 📞 Getting Help

If you're stuck:

1. Check the error message in your terminal
2. Make sure all prerequisites are installed
3. Verify your .env file has all required settings
4. Try the troubleshooting steps above

## 🎯 Next Steps

Once everything is working:

1. Your API is ready at `http://localhost:3100`
2. Test the endpoints using curl or Postman
3. Connect your frontend application
4. Deploy to production when ready

---

**🎉 Congratulations!** You now have a fully functional smart contract management API running on your machine.

## 🚀 Deployment (Production Ready)

### 📋 Pre-Deployment Checklist

- [ ] Set secure `JWT_SECRET` (32+ characters)
- [ ] Configure production database
- [ ] Set up SSL/HTTPS certificates
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Test all API endpoints

### 🌐 Deploy to Cloud

**Recommended platforms:**

- **Heroku** (Easy deployment)
- **AWS** (Scalable)
- **DigitalOcean** (Developer-friendly)
- **Vercel** (Simple setup)

### 📝 Environment Variables for Production

```env
# Production Database
DATABASE_URL="postgresql://user:password@production-db-url:5432/database"

# Strong JWT Secret
JWT_SECRET="your-production-jwt-secret-32-characters-or-more"

# Production Settings
NODE_ENV="production"
PORT=3100

# Your Production Domain
FRONTEND_URL="https://your-frontend-domain.com"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-production-email@gmail.com"
SMTP_PASSWORD="your-production-app-password"
```

## 📞 Support & Help

### 🆘 Need Help?

- Check error messages in your terminal
- Review the troubleshooting section above
- Make sure all prerequisites are installed
- Verify your .env file is correctly configured

### 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://prisma.io/docs/)
