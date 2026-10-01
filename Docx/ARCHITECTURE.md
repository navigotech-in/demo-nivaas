# Indore House Makers — System Architecture Specification

**Official Brand**: Indore House Makers (`https://indorehousemakers.in/`)  
**Architecture Style**: Decoupled Client-Server SPA Architecture (React 19 + Vite Frontend & Node.js + Express + Prisma 6 + PostgreSQL Backend).

---

## 1. Complete Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend SPA** | React 19 + TypeScript + Vite | Ultra-fast client-side routing via React Router 7, asset bundling via Rollup/Vite |
| **Styling & Tokens** | Tailwind CSS + Vanilla CSS Tokens | Earthy palette (`#FAF8F5`, `#292826`, `#E76F2E`, `#C94F36`), mobile-first bottom nav & floating tablet dock |
| **Server State & Queries** | TanStack Query (React Query) | Cache management, optimistic UI updates, automated re-fetching |
| **Icons & Media** | Lucide React (Custom SVGs) | Clean architectural icons (no cartoon emojis) |
| **Backend API** | Node.js + Express.js + TypeScript | RESTful API (`/api/v1/...`), Zod schema validation, modular controllers & services |
| **Database & ORM** | PostgreSQL + Prisma ORM 6 | ACID transactions, strict schema constraints, relational integrity |
| **Authentication** | JWT + Rotating Refresh Tokens | 15-minute Access Token + 30-day HttpOnly cookie with 15s concurrency grace window & breach detection |
| **Credit Ledger Engine** | Immutable Ledger + `CreditReservation` | Single source of truth: `SUM(amount)` over ledger entries; atomic reservation state machine |
| **Setup Security** | Atomic One-Time Admin Setup | `/setup/admin` protected by `SETUP_SECRET`, `crypto.timingSafeEqual`, and `AdminSetupLock` |
| **SEO & Crawling** | Dynamic XML Sitemaps + JSON-LD | Server-generated segmented sitemaps (`/sitemap.xml`, `/sitemaps/*.xml`), canonical URLs, OpenGraph |
| **Testing** | Vitest + Supertest | 17 integration & unit test suites verifying auth, rotation, ledger, and Prisma transactions |

---

## 2. High-Level System Architecture Diagram

```
                             ┌──────────────────────────────────┐
                             │       Web Browser / Client       │
                             │  React 19 + Vite + React Router  │
                             │   Mobile Bottom Nav / UI Desk    │
                             └────────────────┬─────────────────┘
                                              │  HTTPS / JSON API
                                              │  (Bearer JWT + HttpOnly Cookie)
                             ┌────────────────▼─────────────────┐
                             │     Express API Gateway (/api/v1)│
                             │  Rate Limiters + Zod Validation  │
                             │  Auth Middleware (USER / ADMIN)  │
                             └───────┬──────────────────┬───────┘
                                     │                  │
                    ┌────────────────▼────────┐  ┌──────▼────────────────┐
                    │  Prisma Database Client │  │  Static Asset Server  │
                    │    PrismaService Layer  │  │   (Dist WebP Bundles) │
                    └────────────────┬────────┘  └───────────────────────┘
                                     │
                    ┌────────────────▼────────────────────────┐
                    │            PostgreSQL Database          │
                    │  - Users, RefreshSessions, AuditLogs    │
                    │  - AccessPasses, Products, Purchases    │
                    │  - CreditTransactions, Reservations     │
                    │  - AdminSetupLock, GenerationJobs, Leads│
                    └─────────────────────────────────────────┘
```

---

## 3. Frontend Architecture (React 19 + Vite)

### 3.1 Directory Organization
```
client/src/
├── assets/             # WebP hero banners, architectural textures
├── components/         # Reusable UI components (Nav, BottomNav, NivaasAiStudio, LoginModal, ConsultModal, Footer)
├── hooks/              # Custom hooks (useAuth, useSeoMeta, useDesignCatalogFilters)
├── lib/                # API client (Axios/Fetch), query client configuration
├── pages/              # Routed views (HomePage, HousePlansPage, DesignsPage, InteriorsPage, FaqPage, AdminSetupPage, UserDashboard)
├── App.tsx             # Route registry, modal providers, broadcast channel auth sync
└── main.tsx            # DOM root mounting
```

### 3.2 Authentication & State Synchronization
- **Access Token Memory Storage**: Access token stored in React context/memory with 15-minute lifetime.
- **Cross-Tab Synchronization**: `BroadcastChannel('ihm_auth_sync')` broadcasts token rotation across open browser tabs.
- **15-Second Refresh Grace**: Concurrent refresh requests in multiple tabs within 15 seconds return `401 TOKEN_ALREADY_ROTATED` without terminating the session family.

---

## 4. Backend Architecture & Service Layer

### 4.1 Directory Organization
```
server/src/
├── config.ts           # Typed environment configuration
├── db/
│   ├── prisma.ts       # Singleton PrismaClient instance
│   ├── prismaService.ts# Production database service methods & transactions
│   └── store.ts        # Test mock and offline in-memory store
├── middleware/         # auth (requireAuth, requireAdmin), rateLimiter, errorHandler
├── routes/             # authRoutes, leadsRoutes, adminRoutes, designsRoutes, healthRoutes
├── services/           # authService, creditLedger
└── tests/              # auth.test.ts, prismaIntegration.test.ts
```

### 4.2 Single Source of Truth: Credit Transaction Ledger
```
User Account Balance = SUM(CreditTransaction.amount)

Event Lifecycle:
1. GRANT (+5)      ──> ₹299 Pass purchase recorded.
2. RESERVE (-1)    ──> User triggers AI Generation Job. `CreditReservation` set to RESERVED.
3. CONSUME (0)     ──> AI synthesis succeeds. `CreditReservation` atomically set to CONSUMED.
4. RELEASE (+1)    ──> AI synthesis fails/cancelled. `CreditReservation` atomically set to RELEASED.
```
*Any attempt to settle a non-`RESERVED` reservation throws `RESERVATION_ALREADY_SETTLED`.*

---

## 5. Deployment & Runtime Environment

- **Server Runtime**: Node.js 20+ on Linux (Render / Docker container).
- **Client Delivery**: Optimized static assets in `client/dist` served with cache headers.
- **Database**: PostgreSQL with Prisma migrations applied during CI/CD (`prisma migrate deploy`).
