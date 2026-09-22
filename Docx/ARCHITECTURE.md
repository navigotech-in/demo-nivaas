# System Architecture

Project: NIVAAS (working title) — Residential Architecture & Home Design Platform

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js (React) + TypeScript |
| Styling | Tailwind CSS |
| Server state / data fetching | TanStack Query |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express.js + TypeScript |
| Validation | Zod (shared schema patterns between FE/BE where practical) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT access token + rotating refresh token (httpOnly cookie) |
| Media | Object Storage (S3-compatible) + CDN |
| Image pipeline | On-upload resizing + AVIF/WebP + responsive `srcset` |
| SEO | SSR/SSG/ISR (Next.js), dynamic metadata, JSON-LD, sitemap index, canonical URLs |
| Testing | Vitest (unit), Playwright (E2E), Lighthouse CI (perf/SEO budget) |
| Code quality | ESLint, Prettier |
| API style | REST (versioned, `/api/v1/...`) |

## 2. High-Level System Diagram

```
                         ┌──────────────────────────┐
                         │        CDN (edge)        │
                         │  static assets, images,  │
                         │  cached SSG/ISR pages     │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │   Next.js (React + TS)    │
                         │  SSR / SSG / ISR pages     │
                         │  TanStack Query (client)   │
                         └────────────┬─────────────┘
                                      │  REST (JSON)
                         ┌────────────▼─────────────┐
                         │ Node.js + Express + TS API │
                         │  routes → controllers →    │
                         │  services → repositories   │
                         │  Zod validation middleware  │
                         │  JWT auth + RBAC middleware │
                         └──────┬──────────┬─────────┘
                                │          │
                     ┌──────────▼──┐   ┌───▼─────────────┐
                     │  Prisma ORM  │   │  Object Storage   │
                     │              │   │  (media originals │
                     └──────┬───────┘   │  + variants)      │
                             │           └────────┬──────────┘
                     ┌───────▼────────┐            │
                     │   PostgreSQL    │            ▼
                     │  (relational +  │        CDN serves
                     │  FTS/trigram)   │        optimized images
                     └─────────────────┘
```

## 3. Frontend Architecture (Next.js)

### 3.1 Rendering strategy per route type

| Route type | Strategy | Reason |
|---|---|---|
| Home, static marketing pages | SSG | Rarely changes, max cacheability |
| `/house-plans`, `/elevations`, `/interiors` listing pages | ISR (revalidate e.g. 5–15 min) | Catalog changes moderately; needs to stay crawlable & fast |
| SEO landing pages (`/house-plans/30x50`, etc.) | SSG at build + ISR on-demand revalidation when admin publishes | High-value indexable pages, must be fast and fresh |
| `/design/:slug` detail pages | ISR (on-demand revalidate on publish/update) | Individual design pages, SEO-critical |
| Search results with arbitrary filter combos | SSR (or CSR with `noindex` for filtered states) | Combinatorial explosion — must not be statically generated or indexed wholesale |
| User dashboard, admin panel | CSR behind auth | Not indexable, personalized/private data |

### 3.2 App structure (Next.js App Router)

```
apps/web/
  app/
    (public)/
      page.tsx                      # Home
      house-plans/
        page.tsx                    # Listing + filters
        [slug]/page.tsx             # Landing pages e.g. /house-plans/30x50
      elevations/
        page.tsx
        [slug]/page.tsx
      interiors/
        page.tsx
        [slug]/page.tsx
      design/[slug]/page.tsx        # Unified design detail
      services/
        page.tsx
        [slug]/page.tsx
      search/page.tsx
      blog/
        page.tsx
        [slug]/page.tsx
      about/page.tsx
      contact/page.tsx
    (auth)/
      login/page.tsx
      register/page.tsx
    (account)/
      dashboard/page.tsx
      dashboard/saved/page.tsx
      dashboard/enquiries/page.tsx
      dashboard/profile/page.tsx
    (admin)/
      admin/
        page.tsx                    # Dashboard/overview
        designs/... 
        services/...
        enquiries/...
        users/...
        categories/...
        blog/...
        seo-pages/...
        settings/...
    api/                            # Next.js route handlers only if needed for BFF concerns
    sitemap.xml/route.ts
    robots.txt/route.ts
  components/
    ui/                             # Buttons, inputs, cards, modals (design system primitives)
    layout/                         # Navbar, Footer, Sidebar, Breadcrumbs
    design/                         # DesignCard, Gallery, FilterSidebar, SpecTable
    forms/                          # EnquiryForm, ConsultationForm, AuthForms
  lib/
    api-client.ts                   # typed fetch wrapper
    query-client.ts                 # TanStack Query setup
    seo.ts                          # metadata/JSON-LD helpers
    validators/                     # Zod schemas (shared shapes)
  hooks/
  styles/
```

### 3.3 Client-side data flow
TanStack Query handles client-side fetching/caching for interactive filter/search UIs (listing pages hydrate from SSR/ISR initial data, then TanStack Query takes over for filter changes without full reloads). React Hook Form + Zod handle all form state/validation (enquiry, consultation, auth, admin CRUD forms), submitting to the REST API.

## 4. Backend Architecture (Node/Express)

### 4.1 Layering
`routes → controllers → services → repositories (Prisma) → PostgreSQL`
- **routes**: define HTTP method/path, attach middleware (auth, RBAC, validation).
- **controllers**: parse request, call service, shape response.
- **services**: business logic (e.g. "publish design" also invalidates ISR cache, generates SEO defaults).
- **repositories**: Prisma queries isolated here so services stay storage-agnostic.

### 4.2 Folder structure

```
apps/api/
  src/
    routes/
      auth.routes.ts
      designs.routes.ts
      house-plans.routes.ts
      elevations.routes.ts
      interiors.routes.ts
      categories.routes.ts
      favorites.routes.ts
      services.routes.ts
      enquiries.routes.ts
      consultations.routes.ts
      blog.routes.ts
      seo-pages.routes.ts
      admin/... 
      media.routes.ts
    controllers/
    services/
    repositories/
    middleware/
      auth.middleware.ts            # JWT verify
      rbac.middleware.ts            # role checks
      validate.middleware.ts        # Zod schema validation
      rateLimit.middleware.ts
      errorHandler.middleware.ts
    validators/                     # Zod schemas per resource
    lib/
      prisma.ts
      storage.ts                    # object storage client
      image.ts                      # resize/convert pipeline
      logger.ts
    jobs/                           # background tasks (image processing, sitemap regen)
    config/
  prisma/
    schema.prisma
    migrations/
```

### 4.3 Cross-cutting concerns
- **Validation**: every mutating route validated with Zod before hitting the controller.
- **Error format**: consistent `{ success, error: { code, message, details } }` envelope.
- **Rate limiting**: on auth endpoints and enquiry/consultation submission (spam protection).
- **Logging & audit**: admin mutations write to `AuditLog`.

## 5. Infrastructure

- **Object Storage**: stores original uploads + generated variants (thumbnail/medium/large, AVIF+WebP).
- **CDN**: fronts object storage and static/ISR pages; long cache TTL for immutable media (content-hashed filenames), short/revalidate TTL for pages.
- **Image pipeline**: upload → validate (MIME/size/dimensions) → generate responsive variants → store → serve via CDN with `srcset`/`sizes`; hero/LCP image preloaded, gallery images lazy-loaded below the fold.

## 6. Caching & Performance

- ISR + CDN caching for catalog/listing/detail/SEO pages; on-demand revalidation triggered by admin publish/update actions.
- Database indexes aligned to filter/query patterns: `slug` (unique), `status`, `categoryId`, `styleId`, plus targeted composite indexes on frequently combined filters (e.g. `type + status + publishedAt`) — finalized after query-pattern review, not guessed upfront.
- Route-based code splitting; below-fold components lazy-loaded; fonts self-hosted/optimized; API responses return only needed fields for listing views (lightweight "card" DTOs vs full detail DTOs).
- Targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on catalog and detail pages, enforced via Lighthouse CI budgets.

## 7. Search Architecture

v1: PostgreSQL native full-text search + trigram similarity (`pg_trgm`) + structured filter columns (dimensions, facing, BHK, floors, style) combined in one query layer that also powers free-text parsing (e.g. "30x50 east facing duplex" → width=30, depth=50, facing=EAST, type=DUPLEX). Dedicated search engine (Elasticsearch/Algolia/Meilisearch) is a v2 option once query volume/complexity justifies it — not required for v1.

## 8. Security

- JWT access token (short-lived) + rotating refresh token (httpOnly, secure cookie); logout invalidates refresh session.
- Password hashing (bcrypt/argon2), RBAC middleware (Guest/User/Admin, extensible to Editor if needed).
- Zod input validation on every mutating endpoint; parameterized queries via Prisma (no raw string interpolation).
- Rate limiting on auth + public form endpoints; Helmet security headers; strict CORS allowlist.
- Upload validation: MIME-type allowlist, max size, re-encoding on the server (never trust client-declared type).
- Admin routes require Admin role at both middleware and UI level; audit log on create/update/delete of designs, services, users, settings.
- Secrets via environment variables / secret manager, never committed.

## 9. SEO Architecture (implementation detail; see PRD §5.4/5.5 and PROJECT_PLAN.md for policy)

- Dynamic `<title>`/meta description per page, OpenGraph + Twitter cards, canonical URL on every indexable page.
- JSON-LD: `Product`/`CreativeWork`-style schema for designs, `BreadcrumbList`, `FAQPage` where applicable, `Organization` on home.
- Segmented sitemaps (`sitemap-house-plans.xml`, `sitemap-elevations.xml`, `sitemap-interiors.xml`, `sitemap-services.xml`, `sitemap-blog.xml`) aggregated under a sitemap index.
- Robots rules + `noindex` for arbitrary/thin filter-combination URLs; only curated high-value combinations get static, indexable landing pages (admin-curated, see `SeoLandingPage` entity).

## 10. Testing Strategy

- **Vitest**: unit tests for services, validators, utility functions (both apps).
- **Playwright**: E2E for critical flows — search & filter, design detail → enquiry submission, auth, admin design publish.
- **Lighthouse CI**: performance/SEO/accessibility budgets enforced in CI on key templates (home, listing, detail).
- **RBAC tests**: verify Guest/User/Admin boundaries on every protected route.
