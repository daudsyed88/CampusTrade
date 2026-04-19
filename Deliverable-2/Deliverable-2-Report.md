# Deliverable-2 Report

## 1. Project Overview

**CampusTrade** is a secure campus marketplace web application where students can register with institutional email, create listings, and manage their own listings.  
This deliverable focuses on:

1. Initial implementation of core marketplace features
2. Secure coding practices integrated into backend and frontend code

Tech stack:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL with Prisma ORM

## 2. Initial Implementation Status

The following core modules are implemented:

- User registration and login
- JWT-based authenticated sessions
- Two-factor authentication (TOTP)
- Listing create/read/update/delete flows
- Protected "my listings" flow for owners
- Image upload pipeline for listings
- Basic security monitoring endpoints and logging

Implemented code locations:
- Backend entry point: `server/index.js`
- Auth module: `server/routes/auth.js`
- 2FA module: `server/routes/twoFactor.js`
- Listings module: `server/routes/listings.js`
- Frontend listing page: `client/src/pages/ListingDetail.jsx`
- Frontend API client: `client/src/api/axios.js`

## 3. Secure Coding Controls Implemented

### 3.1 Authentication Security

- Passwords are hashed with bcrypt (`saltRounds = 12`) before storage.
- Login uses generic error responses to reduce user enumeration risk.
- Token-based auth is implemented with JWT and short token lifetime.
- 2FA login step uses a temporary token and TOTP verification.

Code references:
- `server/routes/auth.js`
- `server/routes/twoFactor.js`

### 3.2 Input Validation and Data Handling

- `express-validator` is used to validate user inputs for registration, login, and listing operations.
- Input constraints enforce length, format, and numeric rules.
- Request body limit is enforced (`10kb`) to reduce oversized payload abuse.

Code references:
- `server/routes/auth.js`
- `server/routes/listings.js`
- `server/index.js`

### 3.3 Access Control (Authorization)

- Protected routes require a valid JWT in `Authorization: Bearer <token>`.
- Ownership checks prevent users from editing/deleting other users' listings (IDOR defense).
- Listing deletion is soft-delete (`isActive = false`) to preserve records.

Code references:
- `server/middleware/auth.js`
- `server/routes/listings.js`

### 3.4 Injection and XSS Defense

- Database interactions use Prisma ORM (parameterized query model), reducing SQL injection risk.
- Listing descriptions are sanitized in the frontend using DOMPurify before rendering.

Code references:
- `server/routes/listings.js`
- `server/prisma/schema.prisma`
- `client/src/pages/ListingDetail.jsx`

### 3.5 File Upload Security

- Uploads are restricted to JPEG/PNG MIME types.
- Files are processed in memory and re-encoded via Sharp.
- Metadata stripping and image normalization are applied.
- File size limits are enforced.

Code references:
- `server/middleware/upload.js`

### 3.6 Brute-Force and Abuse Resistance

- Rate limiting is applied to login attempts (5 attempts / 15 minutes per IP).
- Failed login attempts are recorded for monitoring.

Code references:
- `server/middleware/rateLimiter.js`
- `server/routes/auth.js`
- `server/routes/twoFactor.js`

### 3.7 Security Headers and Transport Layer Controls

- `helmet` middleware sets secure HTTP headers.
- CORS allowlist restricts frontend origins.

Code references:
- `server/index.js`

### 3.8 Audit Logging and Accountability

- Security-relevant actions are logged to `AuditLog`.
- Failed authentication attempts are recorded in `FailedLogin`.

Code references:
- `server/routes/auth.js`
- `server/routes/listings.js`
- `server/routes/twoFactor.js`
- `server/prisma/schema.prisma`

## 4. Mapping to Common Security Risks

- Broken Access Control -> ownership checks on update/delete
- Cryptographic Failures -> bcrypt password hashing
- Injection -> Prisma ORM and strict validation
- Identification and Authentication Failures -> JWT + 2FA + rate limiting
- Security Logging and Monitoring Failures -> audit and failed login tables

## 5. How to Run (Submission Reproducibility)

1. Configure `server/.env` from `.env.example` with:
   - `DATABASE_URL`
   - `JWT_SECRET`
2. Install backend packages in `server/`
3. Run Prisma migrations and generate client
4. Start backend (`npm run dev`)
5. Install frontend packages in `client/`
6. Start frontend (`npm run dev`)

## 6. Deliverable-2 Conclusion

Deliverable-2 requirements are satisfied with:

- Initial implementation of core system modules
- Integrated secure coding controls in authentication, authorization, input handling, uploads, session handling, and logging
- Source code organized for review in `client/` and `server/` folders with explicit security-focused modules
