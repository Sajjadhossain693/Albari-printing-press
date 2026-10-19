# Security & Reliability Policy
## Al-Bari Press & Digital Sign Management System

### 1. Authentication & Token Management
- **Password Protection**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with a work factor of 10.
- **JWT Protection**: Tokens are signed using HMAC-SHA256 with secrets configured through environment variables.
- **Role Enforcement**: Every administrative endpoint enforces server-side Role-Based Access Control (RBAC).

### 2. Financial Integrity & Idempotency
- **Atomic Operations**: Payments and refunds execute within Prisma database transactions (`prisma.$transaction`) ensuring balance recalculations and ledger insertions succeed or rollback together.
- **Non-negative Balances**: Order dues cannot drop below zero without explicitly audited refunds.
- **Auditing**: Audit logs capture critical operations (payments, refunds, deletions) along with timestamp, user ID, and change notes.

### 3. File Storage & Upload Safety
- **Upload Boundaries**: Strict 50MB file size limit per upload to prevent denial-of-service via massive prepress raster files.
- **Static Asset Isolation**: Uploaded files receive sanitized random hexadecimal filenames preventing directory traversal attacks.

### 4. Public Order Privacy Protection
- Order tracking requires either:
  1. A cryptographically random 32-character tracking token, OR
  2. The Order Number **plus** the verified Customer Phone Number.
- The public tracking endpoint excludes sensitive customer addresses, internal operator notes, and private staff comments.
