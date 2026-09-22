# Product Requirements Document (PRD)

**Project (working title):** NIVAAS — Residential Architecture & Home Design Platform
**Benchmark reference:** makemyhouse.com (feature benchmark only — not a visual/content clone)
**Version:** v1.0
**Status:** Draft for review

---

## 1. Purpose

Build a discovery-and-services platform for Indian residential architecture: house/floor plans, 3D elevations, and interior designs, searchable by plot size, facing, BHK, floors and style, backed by an architectural-services enquiry/consultation funnel and an admin CMS. Functional scope is comparable to makemyhouse.com; information architecture, visual design, navigation and component system are original.

## 2. Goals

- G1: Let a visitor find a relevant house plan/elevation/interior in under 3 searches/filters.
- G2: Convert design-detail views into enquiries/consultation requests.
- G3: Rank for long-tail, high-intent search queries ("30x50 east facing house plan") via programmatic SEO landing pages.
- G4: Keep Core Web Vitals in the "Good" band on listing and detail pages despite heavy imagery.
- G5: Give admins a CMS to publish/manage designs, services, content and leads without developer involvement.

## 3. Non-goals (v1)

- No payments/checkout (services are enquiry/consultation based, not e-commerce, in v1).
- No architect/professional marketplace login or bidding system (candidate for v2).
- No real-time chat (enquiries are form + email/notification based).
- No mobile native app (responsive web only).
- No multi-language i18n in v1 (English + Hindi copy conventions allowed in content, not full i18n framework).

## 4. Users & Roles

| Role | Description | Key needs |
|---|---|---|
| Guest | Unauthenticated visitor | Browse, search, filter, view details, submit enquiry (with contact info) |
| User / Customer | Registered visitor | Save/favourite designs, track enquiries & consultation requests, manage profile |
| Admin | Internal staff/owner | Manage designs, categories, services, leads, content, SEO pages, site settings |

Architect/Designer as a distinct portal role is deferred to v2 (see Section 3).

## 5. Feature Scope (v1)

### 5.1 House Plans
Browse/search/filter by plot width × depth, unit (ft/m), facing (N/S/E/W/NE/NW/SE/SW), BHK (1–6+), floors (G, G+1, G+2…), bathrooms, parking, Vastu compliance, plot type (corner/regular), style, budget band. Each plan has a detail page (see 5.5).

### 5.2 3D Elevations
Browse/search by floors, plot width, architectural style (modern/contemporary/colonial/etc.), facing. Detail page with gallery and specs.

### 5.3 Interior Designs
Room-wise browse (living room, kitchen, bedroom, bathroom, pooja room, etc.), style filters. Detail page with gallery and description.

### 5.4 Search & Discovery
Global search (parses free text like "30x50 east facing duplex" into structured filters), category browse, filter sidebar, sort (relevance/newest/popular), "similar/related designs" on detail pages.

### 5.5 Design Detail Page (shared shape for plan/elevation/interior)
Gallery, plot dimensions, built-up area, bedrooms, bathrooms, floors, facing, parking, Vastu, description, features list, similar designs, related elevations/interiors, Save (favourite), Share, "Request customization" and "Talk to an architect" CTAs. SEO: breadcrumbs, canonical, OpenGraph, JSON-LD, alt text.

### 5.6 User System
Register/login (email+password, JWT access + refresh token), profile, saved/favourite designs, list of enquiries and consultation requests with status.

### 5.7 Services / Consultation
Service catalog: Floor Plan Design, 3D Elevation, Structural Drawing, Working Drawings, Electrical Drawing, Plumbing Drawing, Interior Design, Vastu Consultation, Custom House Design. Each service has a detail page and a requirement/enquiry form (plot details, budget, timeline, contact info, file/reference upload optional).

### 5.8 Admin / CMS
CRUD for designs (house plans, elevations, interiors) with structured attributes + media; categories/styles/tags/amenities; services & packages; enquiries & consultation request management (status pipeline); users; blog/guides; SEO landing pages; FAQs; testimonials; media library; site settings; audit log.

### 5.9 Supporting Content
Blog/guides (SEO content), FAQs, About, Contact, legal pages (privacy/terms), SEO-optimized static + programmatic landing pages.

## 6. Key User Stories

1. As a visitor, I can filter house plans by plot size and facing so I only see relevant results.
2. As a visitor, I can search "30x50 east facing" and land on a matching landing page or filtered result set.
3. As a visitor, I can view a plan's full detail (dimensions, floors, images) and request customization.
4. As a registered user, I can save designs and revisit them later from my dashboard.
5. As a registered user, I can submit a consultation request and track its status.
6. As an admin, I can publish a new house plan with images, structured attributes and SEO fields in one flow.
7. As an admin, I can see and manage all incoming enquiries/consultation requests with status updates.
8. As an admin, I can create a new SEO landing page (e.g. "25x40 Duplex House Plans") that pulls matching designs dynamically.

## 7. Success Metrics

- Search-to-detail click-through rate.
- Detail-page-to-enquiry conversion rate.
- Organic sessions landing on programmatic SEO pages.
- LCP / INP / CLS on top 10 landing pages (Core Web Vitals "Good" threshold).
- Admin time-to-publish for a new design (target: under 10 minutes).

## 8. Assumptions & Constraints

- Content/imagery will be original or licensed — no assets copied from the reference site.
- v1 targets desktop + mobile web only, India-first (INR pricing/timezone conventions where relevant).
- Full-text search handled by PostgreSQL (trigram/FTS); dedicated search engine (e.g. Elasticsearch/Algolia) deferred until scale demands it.
- Hosting/infra choice (Vercel/AWS/etc.) not fixed in this PRD; see ARCHITECTURE.md infra section for requirements the host must satisfy.

## 9. Open Questions

- Final brand name/domain.
- Whether "Projects" (post-enquiry project lifecycle tracking) ships in v1 or v1.1.
- Paid vs free consultation policy (affects Service/ServicePackage pricing model).
