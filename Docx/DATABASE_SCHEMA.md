# Indore House Makers — Database Schema & Architecture

**Database**: PostgreSQL (Supabase / Self-hosted)  
**ORM**: Prisma 6  
**File**: `server/prisma/schema.prisma`

---

## 🗺️ Entity Relationship Summary

```
User (1) ───< (N) RefreshSession
User (1) ───< (N) AccessPass
User (1) ───< (N) CreditTransaction
User (1) ───< (N) CreditReservation
User (1) ───< (N) GenerationJob
User (1) ───< (N) Purchase ───< (N) Payment
User (1) ───< (N) Lead

AdminSetupLock (Single Row Unique Lock: "SETUP_LOCK")
Product (1) ───< (N) Purchase
```

---

## 📋 Core Entity Models

### 1. `User`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Unique user identifier (`usr_...`) |
| `email` | `String` | `@unique` | Normalized lowercase email address |
| `passwordHash` | `String` | | Bcrypt hash (salt rounds: 10) |
| `name` | `String` | | Full name |
| `phone` | `String?` | | 10-digit Indian phone number |
| `role` | `UserRole` | `@default(USER)` | `USER` or `ADMIN` (only 2 roles) |
| `isEmailVerified`| `Boolean` | `@default(false)` | Email verification flag |
| `isPhoneVerified`| `Boolean` | `@default(false)` | Phone verification flag |
| `createdAt` | `DateTime` | `@default(now())` | Registration timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last modification timestamp |

---

### 2. `RefreshSession` (Token Family & Breach Detection)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Session ID (`ses_...`) |
| `userId` | `String` | `@relation` | Foreign key to `User` |
| `familyId` | `String` | | Group ID for rotation lineage tracking |
| `tokenHash` | `String` | `@unique` | SHA-256 hash of raw 80-char hex token |
| `userAgent` | `String` | | Browser user agent string |
| `ipAddress` | `String` | | Client IP address |
| `isRevoked` | `Boolean` | `@default(false)` | Revocation flag |
| `rotatedAt` | `DateTime?` | | Rotation timestamp (for 15s grace handling) |
| `expiresAt` | `DateTime` | | Expiry (30 days) |

---

### 3. `AccessPass` (₹299 30-Day Design Pass)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Pass ID (`pass_...`) |
| `userId` | `String` | `@relation` | User owning the pass |
| `purchaseId` | `String?` | `@relation` | Associated purchase transaction |
| `passType` | `PassType` | `@default(DESIGN_PASS_299)` | Pass tier |
| `status` | `PassStatus`| `@default(ACTIVE)` | `ACTIVE`, `EXPIRED`, `REVOKED` |
| `startsAt` | `DateTime` | `@default(now())` | Activation timestamp |
| `expiresAt` | `DateTime` | | 30 days validity |
| `creditsGranted`| `Int` | `@default(5)` | 5 AI generation credits |

---

### 4. `CreditTransaction` (Immutable Ledger — Single Source of Truth)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Transaction ID (`tx_...`) |
| `userId` | `String` | `@relation` | User account |
| `passId` | `String?` | `@relation` | Linked pass (optional) |
| `amount` | `Int` | | Delta value (+5 for GRANT, -1 for RESERVE, +1 for RELEASE, 0 for CONSUME) |
| `type` | `CreditEventType` | | `GRANT`, `RESERVE`, `RELEASE`, `CONSUME`, `EXPIRE`, `ADJUSTMENT` |
| `description` | `String` | | Human-readable audit text |
| `referenceType` | `String?` | | `PURCHASE`, `GENERATION_JOB`, `MANUAL` |
| `referenceId` | `String?` | | Reservation ID or Job ID |
| `createdAt` | `DateTime` | `@default(now())` | Immutable entry timestamp |

---

### 5. `CreditReservation` (State Machine & Anti-Double-Settlement)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Reservation ID (`res_...`) |
| `userId` | `String` | `@relation` | User holding reservation |
| `jobId` | `String` | | AI generation job ID |
| `amount` | `Int` | `@default(1)` | Number of credits reserved |
| `status` | `ReservationStatus` | `@default(RESERVED)` | `RESERVED`, `CONSUMED`, `RELEASED` |
| `settledAt` | `DateTime?` | | Settlement timestamp |

---

### 6. `AdminSetupLock` (Atomic First-Admin Bootstrap)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default("SETUP_LOCK")` | Singleton primary key |
| `isLocked` | `Boolean` | `@default(false)` | Permanently `true` once first admin exists |
| `adminId` | `String?` | `@unique` | ID of bootstrapped admin |
| `lockedAt` | `DateTime?` | | Timestamp when setup was permanently locked |

---

### 7. `Lead` (Consultation & AI Plan Capture)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Lead ID (`lead_...`) |
| `userId` | `String?` | `@relation` | Linked user (if authenticated) |
| `type` | `String` | `@default("CONSULTATION")` | `CONSULTATION`, `AI_CUSTOM_PLAN`, `COST_ESTIMATE` |
| `name` | `String` | | Contact person name |
| `phone` | `String` | | Contact phone number |
| `city` | `String` | `@default("Indore")` | Construction location |
| `wizardData` | `Json?` | | Full 20/23-step wizard payload for AI synthesis |
| `status` | `LeadStatus` | `@default(NEW)` | `NEW`, `CONTACTED`, `QUALIFIED`, `CONVERTED`, `CLOSED` |

---

### 8. `AuditLog` (Security Trail)
| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id @default(uuid())` | Audit entry ID |
| `actorId` | `String?` | | User ID performing the action |
| `actorRole` | `String?` | | `USER`, `ADMIN`, `SYSTEM`, `ANONYMOUS` |
| `action` | `String` | | e.g. `auth.login_success`, `auth.token_reuse_detected`, `ledger.reserve` |
| `entityType` | `String` | | e.g. `User`, `RefreshSession`, `CreditTransaction` |
| `metadata` | `Json?` | | Additional context parameters |
