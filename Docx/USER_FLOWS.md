# Indore House Makers — Core User Flows & Journeys

---

## 1. User Authentication & Session Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Client as React Client (Vite)
    participant Server as Express API (/api/v1)
    participant DB as PostgreSQL (Prisma)

    Note over User,DB: 1. User Registration / Login
    User->>Client: Enters Email & Password
    Client->>Server: POST /auth/login or /auth/signup
    Server->>DB: Verify bcrypt password hash / Create user
    Server-->>Client: 200 OK (AccessToken in JSON, HttpOnly Cookie: ihm_refresh_token)
    Client->>Client: Stores AccessToken in memory, sets Auth state

    Note over User,DB: 2. Automatic Token Refresh & 15s Grace Window
    Client->>Server: POST /auth/refresh (Cookie attached)
    Server->>DB: Check RefreshSession (15s concurrency grace check)
    Server->>DB: Rotate session & create new RefreshSession in family
    Server-->>Client: 200 OK (New AccessToken + new HttpOnly Cookie)
    Client->>Client: Broadcasts new token via BroadcastChannel('ihm_auth_sync')

    Note over User,DB: 3. Session Revocation / Logout
    User->>Client: Clicks Logout
    Client->>Server: POST /auth/logout (Bearer Token)
    Server->>DB: Mark RefreshSession isRevoked = true
    Server-->>Client: 200 OK (Clears Cookie)
```

---

## 2. One-Time Admin Setup Flow (`/setup/admin`)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as First Administrator
    participant Client as React (/setup/admin)
    participant Server as Express API
    participant DB as PostgreSQL (Prisma)

    Client->>Server: GET /auth/setup-status
    Server->>DB: Check ADMIN count & AdminSetupLock
    Server-->>Client: { isSetupAllowed: true } (if 0 admins)
    
    Admin->>Client: Fills Name, Email, Password, SETUP_SECRET
    Client->>Server: POST /auth/setup-admin
    Server->>Server: Timing-safe comparison (crypto.timingSafeEqual)
    Server->>DB: $transaction: Lock AdminSetupLock + Create Admin User
    Server-->>Client: 201 Created (Admin AccessToken + Cookie)
    
    Note over Client,DB: Subsequent attempts are permanently rejected with 403 SETUP_ALREADY_COMPLETED
```

---

## 3. ₹299 Design Pass & Credit Ledger Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as User
    participant Client as React Client
    participant Server as Express API
    participant Razorpay as Razorpay Gateway
    participant DB as PostgreSQL (Prisma)

    Customer->>Client: Selects ₹299 30-Day Design Pass
    Client->>Server: POST /payments/create-order
    Server->>Razorpay: Create Order (₹299)
    Server-->>Client: orderId, key, amount
    Client->>Razorpay: Opens Checkout Modal
    Razorpay-->>Client: Payment Success (paymentId, signature)
    Client->>Server: POST /payments/verify (or Webhook)
    Server->>DB: $transaction: Create AccessPass + CreditTransaction (+5 GRANT)
    Server-->>Client: 200 OK (Updated balance: 5 Credits)
```

---

## 4. AI Generation Wizard & Reservation State Machine

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as AI Studio Wizard
    participant Server as Express API
    participant DB as PostgreSQL (Prisma)
    participant AI as AI Planner Worker

    User->>Client: Completes 20/23-Step Wizard & Clicks "Generate Plan"
    Client->>Server: POST /ai/generate (wizardData)
    Server->>DB: $transaction: Verify Balance >= 1, Create CreditReservation (RESERVED), Ledger (-1 RESERVE)
    Server->>AI: Enqueue GenerationJob (QUEUED)
    Server-->>Client: 202 Accepted (jobId, reservationId)
    
    loop Polling Status
        Client->>Server: GET /ai/jobs/:jobId
        Server-->>Client: { status: "PROCESSING" }
    end

    alt Synthesis Succeeded
        AI->>Server: Job Finished
        Server->>DB: $transaction: CreditReservation (CONSUMED), Ledger (0 CONSUME)
        Server-->>Client: { status: "COMPLETED", resultPayload: { ... } }
    else Synthesis Failed / Timed Out
        AI->>Server: Job Failed
        Server->>DB: $transaction: CreditReservation (RELEASED), Ledger (+1 RELEASE Refund)
        Server-->>Client: { status: "FAILED", errorMessage: "..." }
    end
```

---

## 5. User Panel Journey (Phase 2)

1. **Dashboard Entry**: User logs in and visits `/dashboard` on mobile/desktop.
2. **Overview Cards**: User sees active pass badge, remaining credits, and quick CTAs.
3. **Projects Tab**: User browses generated floor plans, views specifications, and downloads high-definition CAD/PDF files.
4. **Saved Designs Tab**: User reviews bookmarked house plans from the public catalog.
5. **Consultations Tab**: User tracks status of scheduled architect review calls.
6. **Credit History Tab**: User reviews transparent immutable ledger entries (`GRANT`, `RESERVE`, `RELEASE`).
