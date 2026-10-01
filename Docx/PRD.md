# Indore House Makers — Product Requirements Document (PRD)

**Project**: Indore House Makers — Architectural Design & AI Floor Planning Platform  
**Live Canonical**: `https://indorehousemakers.in/`  
**Version**: v2.0 (Phase 1.1 Complete, Entering Phase 2: User Panel)  
**Status**: Active Production Plan

---

## 1. Executive Summary & Vision

Indore House Makers is a modern digital platform for Indian residential architecture, CAD house plans, 3D front elevations, interior designs, and instant AI-guided floor planning. It combines a verified catalog of 480+ Indian plot dimensions (30x50, 20x40, 40x60, etc.) with a 20/23-step Vastu-compliant AI Planner, turnkey cost estimator for Madhya Pradesh, and an architect consultation booking funnel.

---

## 2. Core User Roles & Permissions

| Role | Access Scope | Capabilities |
|---|---|---|
| **Guest** | Public Pages | Browse catalog, search/filter plans, view specifications, submit leads/consultations, test AI Studio prompts. |
| **User (Customer)** | Protected User Panel | Manage profile, view saved designs, track booked consultations, access ₹299 Design Pass, view live credit ledger balance & download generated 2D/3D plans. |
| **Admin** | Protected Admin Panel | Manage consultation leads pipeline, oversee user directory & credit ledger audit logs, publish/update catalog designs, system analytics. |

---

## 3. Key Feature Modules

### 3.1 AI Architect Studio & Wizard
- **Shape Branching Engine**:
  - **Regular Plots (20 Steps)**: Rectangular 4-sided plots with 90° corners, automatic setbacks (GHMC/BBMP/MP bylaws).
  - **Asymmetric Plots (23 Steps)**: L-shape, corner cuts, trapezoids, odd boundary angles with uploaded survey maps and AI smart setback suggestions.
- **Vastu Compliance Engine**: Automatic placement verification (Pooja in NE / Ishanya, Kitchen in SE / Agneya, Master Bedroom in SW / Nairutya).
- **Turnkey Cost Estimation**: Real-time Indore material rate calculations (Standard, Executive ₹2,350/sq.ft, Luxury).
- **Asynchronous Synthesis**: Async generation job queue with atomic credit reservation and duplicate settlement prevention.

### 3.2 Access Pass & Immutable Credit Ledger
- **₹299 30-Day Design Pass**: Grants 5 high-definition AI generation credits valid for 30 days.
- **Credit Transaction Ledger**: Single source of truth. Every transaction delta (`GRANT`, `RESERVE`, `RELEASE`, `CONSUME`) is immutable.
- **Atomic Reservation Lock**: Every generation reserves 1 credit (`status = RESERVED`). On success, confirmed with 0 delta (`status = CONSUMED`); on failure/timeout, refunded with +1 delta (`status = RELEASED`). Cannot be settled twice.

### 3.3 User Panel (Phase 2 Focus)
- **Mobile-First Dashboard**: Overview cards with active pass status, remaining credits, and quick CTAs.
- **My Projects**: Listing of user-generated floor plans and elevation concepts with status badges and download links.
- **Saved Designs (Favorites)**: Bookmark catalog house plans and 3D elevations.
- **Consultation Tracker**: Live status of booked architect callbacks and design consultations.
- **Credit History Ledger**: Transparent audit list of all credit grants, reserves, and refunds.
- **Clean Empty States**: Graceful 0-state UI when user has no projects or bookmarks yet.

### 3.4 Admin Panel (Phase 3 Focus)
- **Desktop-Focused Control Center**: Key metrics (total users, active passes, pending leads).
- **Leads Status Pipeline**: Move leads from `NEW` → `CONTACTED` → `QUALIFIED` → `CONVERTED` → `CLOSED`.
- **User Directory & Security Audit**: Audit log viewer for auth events and credit transactions.

---

## 4. Phased Master Roadmap

```
Phase 0: Foundation (Monorepo, TS, Prisma, Config)                   ──> [DONE]
Phase 1: Auth + RBAC + 15m JWT + 30d Cookie + 15s Grace Window       ──> [DONE]
Phase 1.1: DB Service + Credit State Machine + AdminSetupLock        ──> [DONE]
Phase 2: User Panel (Mobile-First Dashboard, Projects, Ledger UI)   ──> [IN PROGRESS]
Phase 3: Admin Panel (Desktop Leads Pipeline, Users, CMS)            ──> [QUEUED]
Phase 4: AI Planner Job Queue & PDF/CAD Exporter                     ──> [QUEUED]
Phase 5: Payments (₹299 Pass, Razorpay Webhooks)                     ──> [QUEUED]
Phase 6: Catalog & Discovery (SEO Landing Pages & Dynamic Sitemaps)  ──> [QUEUED]
Phase 7: Performance & Image Optimization                            ──> [QUEUED]
Phase 8: Final Security Audit & Launch Checklist                     ──> [QUEUED]
```
