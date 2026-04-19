# CampusTrade

A secure campus marketplace web application. Built for CY-321 Secure Software Development, GIKI.

## Prerequisites
- Node.js v20 LTS
- PostgreSQL v15 running locally
- npm v9+

## Setup

### 1. Set up the database
Create a locally installed PostgreSQL database named `campustrade`.
In psql: CREATE DATABASE campustrade;

### 2. Configure environment
cd server
cp .env.example .env
# Edit .env — set DATABASE_URL to your ACTUAL local PostgreSQL credentials (username and password) and JWT_SECRET

### 3. Install backend dependencies and run migrations
npm install
npx prisma migrate dev --name init
npx prisma generate

### 4. Start the backend
npm run dev
# Server runs on http://localhost:5000

### 5. Install frontend dependencies
cd ../client
npm install

### 6. Start the frontend
npm run dev
# App runs on http://localhost:5173

## Security Features
- .edu-only registration
- bcrypt password hashing (saltRounds=12)
- JWT authentication
- Rate limiting on login (5 attempts / 15 min)
- Object-level authorization on all write operations
- SQL injection prevention via Prisma ORM
- XSS prevention via DOMPurify
- Helmet security headers
- MIME-type validated file uploads
- Append-only audit logging
