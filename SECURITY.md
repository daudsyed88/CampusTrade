# CampusTrade Security Architecture & Controls

This document maps the security controls implemented in the CampusTrade application, providing a reference for code reviewers and graders.

## 1. Authentication & Identity Management

### 1.1 Secure Password Hashing
- **Control**: All passwords are cryptographically hashed using `bcrypt` with a work factor (`saltRounds`) of 12.
- **Location**: `server/routes/auth.js` (`/register` route) 
- **Threat Mitigated**: Broken Authentication (OWASP A07:2021). Prevents offline dictionary attacks if the database is compromised.

### 1.2 Domain Restrictions (.edu Enforcement)
- **Control**: Regex validation enforces that only `.edu` institutional email addresses can register.
- **Location**: `server/routes/auth.js` (`/register` route)
- **Threat Mitigated**: Spoofing (STRIDE) / Sybil Attacks. Ensures the marketplace is restricted to verifiable students.

### 1.3 Two-Factor Authentication (TOTP)
- **Control**: Time-based One-Time Password (TOTP) integration using Google Authenticator and the `otplib` package.
- **Location**: `server/routes/twoFactor.js` and `server/routes/auth.js` (Login flow)
- **Threat Mitigated**: Credential Stuffing / Phishing. Protects accounts even if passwords are leaked.

### 1.4 Stateless Session Management (JWT)
- **Control**: JSON Web Tokens signed with `HS256` and a short lifespan (1 hour). Sent via `Authorization: Bearer` headers.
- **Location**: `server/routes/auth.js`
- **Threat Mitigated**: Session Hijacking. Reduces the window of opportunity for stolen tokens.

## 2. Authorization & Access Control

### 2.1 Ownership Verification (IDOR Prevention)
- **Control**: Before any Listing can be updated or deleted, the server verifies `listing.ownerId === req.user.userId`.
- **Location**: `server/routes/listings.js` (`PATCH /:id` and `DELETE /:id`)
- **Threat Mitigated**: Insecure Direct Object References (Broken Access Control - OWASP A01:2021).

### 2.2 Role-Based Access Control (RBAC)
- **Control**: `adminCheck` middleware prevents standard users from accessing the Security Dashboard telemetry.
- **Location**: `server/routes/security.js`

## 3. Data Integrity & Input Validation

### 3.1 Parameterized Queries
- **Control**: The application exclusively uses Prisma ORM. No raw SQL queries are executed.
- **Location**: Entire application (e.g., `server/routes/listings.js`)
- **Threat Mitigated**: SQL Injection (OWASP A03:2021).

### 3.2 Payload Sanitization (XSS Defense)
- **Control**: User-generated content (descriptions) is sanitized on the client side using `DOMPurify` before rendering to the DOM.
- **Location**: `client/src/pages/ListingDetail.jsx`
- **Threat Mitigated**: Cross-Site Scripting (XSS / OWASP A03:2021).

### 3.3 Strict Request Validation
- **Control**: `express-validator` strictly checks types, lengths, and formats for all incoming POST/PATCH requests.
- **Location**: `server/routes/auth.js` and `server/routes/listings.js`

## 4. File Upload Security

### 4.1 Memory-Buffer Re-encoding (Sharp)
- **Control**: Uploaded buffers are intercepted, fully decoded, and re-encoded to generic JPEG by `sharp` before touching the filesystem.
- **Location**: `server/middleware/upload.js` (`processImage` function)
- **Threat Mitigated**: Remote Code Execution (RCE) / Polyglot Files. 

### 4.2 Metadata Stripping
- **Control**: EXIF data is stripped out during the `sharp` pipeline (`.withMetadata(false)`).
- **Location**: `server/middleware/upload.js`
- **Threat Mitigated**: Information Disclosure (STRIDE). Removes GPS coordinates and device identifiers.

## 5. Defense in Depth & Telemetry

### 5.1 Audit Logging
- **Control**: All significant write actions (REGISTER, LOGIN, CREATE_LISTING, UPDATE_LISTING, DELETE_LISTING, 2FA_ENABLED) are immutably logged to the database.
- **Location**: Scattered throughout `server/routes/auth.js`, `server/routes/listings.js`, `server/routes/twoFactor.js`
- **Threat Mitigated**: Non-repudiation (STRIDE). Ensures a forensic trail exists.

### 5.2 Anti-Enumeration & Rate Limiting
- **Control**: Login routes are protected by `express-rate-limit` (5 attempts / 15 min). Failed attempts track the IP and return generic "Invalid credentials" messages.
- **Location**: `server/routes/auth.js` and `server/middleware/rateLimiter.js`
- **Threat Mitigated**: Brute Force Attacks & User Enumeration. By logging `FailedLogin`, administrators can monitor attacks on the Security Dashboard.

### 5.3 Security Headers
- **Control**: `helmet` automatically sets protective HTTP headers like `X-Frame-Options` (DENY), `X-Content-Type-Options` (nosniff), and `Strict-Transport-Security`.
- **Location**: `server/index.js`
- **Threat Mitigated**: Clickjacking, MIME-sniffing exploits.
