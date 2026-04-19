# Source Code Submission Map (Deliverable-2)

This document identifies the source files that implement Deliverable-2 requirements (initial implementation + secure coding).

## Backend (Security-Critical)

- `server/index.js`  
  App initialization, Helmet headers, CORS restrictions, JSON body limit, route mounting.

- `server/routes/auth.js`  
  Registration validation, `.edu` enforcement, password hashing, login flow, JWT issuance, failed login logging.

- `server/routes/twoFactor.js`  
  TOTP setup, setup verification, 2FA login verification, enable/disable workflow.

- `server/routes/listings.js`  
  Listing CRUD, validation, ownership checks (IDOR prevention), soft delete, audit logging.

- `server/middleware/auth.js`  
  JWT verification middleware for protected routes.

- `server/middleware/rateLimiter.js`  
  Login brute-force protection.

- `server/middleware/upload.js`  
  File type filtering, Sharp re-encoding, upload size limits, metadata reduction pipeline.

- `server/prisma/schema.prisma`  
  Data models (`User`, `Listing`, `AuditLog`, `FailedLogin`) supporting secure workflow.

## Frontend (Security-Relevant)

- `client/src/api/axios.js`  
  Centralized API client, auth header attachment, 401 handling.

- `client/src/pages/ListingDetail.jsx`  
  DOMPurify sanitization for rendered listing content (XSS defense).

## Notes for Evaluator

- Complete runnable source is available in top-level `client/` and `server/` directories.
- This file provides a focused map of the modules most relevant to Deliverable-2 grading criteria.
