# Indore House Makers — REST API Route Registry

**Base URL**: `/api/v1`  
**Authentication**: `Authorization: Bearer <accessToken>` header for protected routes.  
**Refresh Token**: Set via secure `HttpOnly` cookie (`ihm_refresh_token`).  
**Roles**: `USER`, `ADMIN`.

---

## 1. Authentication & Session (`/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | Public | Register new user account with name, email, password, and optional phone |
| `POST` | `/api/v1/auth/login` | Public | Authenticate via email or phone + password; returns 15m JWT + sets HttpOnly cookie |
| `POST` | `/api/v1/auth/refresh` | Public (Cookie) | Rotates refresh token with 15s grace window; revokes family on breach |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revokes current session or token family and clears refresh cookie |
| `GET` | `/api/v1/auth/me` | `USER` / `ADMIN` | Fetches active profile, live credit balance, and active pass details |
| `POST` | `/api/v1/auth/forgot-password` | Public | Dispatches password reset link (constant-time safe response) |
| `GET` | `/api/v1/auth/setup-status` | Public | Checks if initial admin setup is allowed (`adminCount === 0`) |
| `POST` | `/api/v1/auth/setup-admin` | Public (Secret) | One-time atomic admin account bootstrapping with `SETUP_SECRET` & `AdminSetupLock` |

---

## 2. Health & System (`/health`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | System status, service identity, and timestamp |

---

## 3. Leads & Consultations (`/leads`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/leads` | Public (Rate Limited) | Submit general consultation enquiry or AI Studio custom plan lead |

---

## 4. User Panel (`/users`) — *Phase 2 (Completed)*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/me/dashboard` | `USER` / `ADMIN` | Overview metrics (projects, live credits, ₹299 pass, consultations, recent activity) |
| `GET` | `/api/v1/users/me/projects` | `USER` / `ADMIN` | List user's created house plans and 3D elevation projects |
| `POST` | `/api/v1/users/me/projects` | `USER` / `ADMIN` | Create new draft floor plan / 3D design job |
| `GET` | `/api/v1/users/me/credits` | `USER` / `ADMIN` | Live balance calculated from immutable ledger + full transaction history |
| `GET` | `/api/v1/users/me/pass` | `USER` / `ADMIN` | Active ₹299 Design Pass status and days remaining countdown |
| `GET` | `/api/v1/users/me/consultations` | `USER` / `ADMIN` | Status of booked architect consultation requests |
| `GET` | `/api/v1/users/me/sessions` | `USER` / `ADMIN` | List active device refresh sessions with `isCurrent` indicator |
| `DELETE` | `/api/v1/users/me/sessions/:sessionId` | `USER` / `ADMIN` | Revoke specific device session with strict ownership check |
| `DELETE` | `/api/v1/users/me/sessions` | `USER` / `ADMIN` | Revoke all other device sessions except current |
| `PATCH` | `/api/v1/users/me/profile` | `USER` / `ADMIN` | Update display name and phone number |
| `POST` | `/api/v1/users/me/change-password` | `USER` / `ADMIN` | Verify current password hash and update to new password |

---

## 5. Admin Panel (`/admin`) — *Phase 3*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/overview` | `ADMIN` | High-level metrics: total users, active passes, revenue, pending leads |
| `GET` | `/api/v1/admin/leads` | `ADMIN` | List and search all consultation and AI synthesis leads with filters |
| `PATCH` | `/api/v1/admin/leads/:id` | `ADMIN` | Update lead status (`NEW`, `CONTACTED`, `QUALIFIED`, `CONVERTED`, `CLOSED`) and notes |
| `GET` | `/api/v1/admin/users` | `ADMIN` | User directory with pass status, credit balance, and activity history |
| `GET` | `/api/v1/admin/audit-log` | `ADMIN` | Security audit trail (logins, token breaches, ledger events) |

---

## 6. AI Generation Jobs (`/ai`) — *Phase 4*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/ai/generate` | `USER` | Reserves credit and queues async 2D/3D generation job (`idempotencyKey`) |
| `GET` | `/api/v1/ai/jobs/:id` | `USER` | Polls job status (`QUEUED` → `PROCESSING` → `COMPLETED` / `FAILED`) |
| `GET` | `/api/v1/ai/jobs/:id/download` | `USER` | High-definition PDF/CAD download (verified active pass) |

---

## 7. Payments & Razorpay (`/payments`) — *Phase 5*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/payments/create-order` | `USER` | Creates Razorpay order for ₹299 30-Day Design Pass |
| `POST` | `/api/v1/payments/verify` | `USER` | Verifies checkout signature and creates `AccessPass` + credit `GRANT` |
| `POST` | `/api/v1/payments/webhook` | Public (Signature) | Server-to-server Razorpay webhook handler for instant settlement |

---

## 8. Catalog & Designs (`/designs`) — *Phase 6*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/designs` | Public | Filtered catalog (house plans, 3D elevations, interiors) with pagination |
| `GET` | `/api/v1/designs/:slug` | Public | Full design blueprint details, room dimensions, Vastu chart |
| `POST` | `/api/v1/admin/designs` | `ADMIN` | Create new catalog design item |
| `PATCH` | `/api/v1/admin/designs/:id` | `ADMIN` | Update catalog specifications and media assets |
| `DELETE` | `/api/v1/admin/designs/:id` | `ADMIN` | Archive/remove design item |

---

## 📦 Standard API Response Envelope

### Success Format:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 120
  }
}
```

### Error Format:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "You need an active Design Pass or generation credits to perform this action.",
    "details": []
  }
}
```
