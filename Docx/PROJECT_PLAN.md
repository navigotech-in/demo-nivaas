# Indore House Makers — Project Master Plan & Phases

**Official Brand Standard**: Indore House Makers (`https://indorehousemakers.in/`)  
**Core Stack**: React 19 + TypeScript + Tailwind CSS / Vanilla tokens (Client), Node.js + Express + Prisma ORM + PostgreSQL (Server).

---

## 🗺️ Master Execution Roadmap

| Phase | Name | Scope & Deliverables | Status |
|---|---|---|---|
| **Phase 0** | **Foundation** | Monorepo structure, TypeScript strict mode, Prisma ORM initialization, environment config, unified API envelope format, error handlers, and base logging. | ✅ **Completed** |
| **Phase 1** | **Authentication & Security** | JWT Access Token (15m) + HttpOnly Refresh Token (30d) with 15s grace rotation and reuse breach family revocation; Roles (`USER`, `ADMIN`); Audit logging; One-time `/setup/admin` screen with `crypto.timingSafeEqual` and atomic `AdminSetupLock`. | ✅ **Completed** |
| **Phase 1.1** | **Database & Ledger Hardening** | `PrismaService` production repository; `CreditReservation` state machine (`RESERVED` → `CONSUMED` / `RELEASED`) with double-settlement protection (`RESERVATION_ALREADY_SETTLED`); 12/12 automated integration tests; Full branding purge to Indore House Makers. | ✅ **Completed** |
| **Phase 2** | **User Panel** *(Current Active)* | Mobile-first User Dashboard; My Projects & Saved Designs; Consultation booking tracker; AI Credit Ledger history with live balance; Profile management; Empty states for 0-records. | 🚀 **In Progress** |
| **Phase 3** | **Admin Panel** | Desktop-focused Admin Dashboard; Lead/Consultation management status pipeline; User directory & role governance; Credit Ledger audit oversight; CMS for Designs catalog. | ⏳ Queued |
| **Phase 4** | **AI Architect & Wizard Engine** | 20-Step Regular Plot Flow + 23-Step Asymmetric Engine; Async AI generation jobs (`QUEUED` → `PROCESSING` → `COMPLETED` / `FAILED`); Automatic credit reservation & settlement; PDF/CAD exports. | ⏳ Queued |
| **Phase 5** | **Payments & Passes** | ₹299 30-Day Design Pass (5 AI Credits); Razorpay Order API + Webhook signature verification; Automatic `GRANT` transaction on capture. | ⏳ Queued |
| **Phase 6** | **Catalog & Discovery** | 480+ Indian house plans, 3D front elevations, interior designs; Vastu filter, BHK filter, plot dimensions, dynamic XML sitemaps, JSON-LD structured data. | ⏳ Queued |
| **Phase 7** | **Performance & Image Optimization** | WebP format, responsive image sizes, CDN caching headers, Lighthouse audit (Core Web Vitals green). | ⏳ Queued |
| **Phase 8** | **Security Audit & Production Launch** | Final penetration/security review, CORS origin lockdown, DB indexes audit, production deployment checklist. | ⏳ Queued |

---

## 🔒 Non-Negotiable Architecture Rules

1. **Brand Standard**: Only **Indore House Makers** across all visible UI, meta tags, and documentation.
2. **Roles**: Only `USER` and `ADMIN` roles. No public signup for admin. Initial admin setup strictly locked via atomic `/setup-admin` route.
3. **Credit Ledger**: The `CreditTransaction` ledger is the single source of truth for credit balance (`SUM(amount)`). Every reservation must be tracked via `CreditReservation` and settled only once.
4. **Zero Fake Data in Production**: Demo accounts and test fixtures are strictly isolated to `import.meta.env.DEV` and test runners.
5. **Separation of Concerns**: User Panel is built mobile-first; Admin Panel is built desktop-first.

---

## 🧪 Testing & Verification Protocol

- **Integration Tests**: `npm test` in `server/` covers signup, login, refresh rotation, race condition admin setup, and duplicate ledger settlement.
- **Client Build Validation**: `npm run build` in `client/` ensures strict TypeScript checking without bundle errors.
- **Documentation Sync**: Any changes to routes, database models, or phase milestones must be updated in the `Docx/` folder immediately.
