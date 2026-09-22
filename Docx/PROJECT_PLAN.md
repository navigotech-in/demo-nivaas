# Project Plan & Phases

## Phases

| Phase | Name | Deliverables |
|---|---|---|
| P0 | Foundation | Monorepo setup, TS strict mode, PostgreSQL + Prisma init, env config, ESLint/Prettier, base error-handling format, logging, CI skeleton |
| P1 | Auth + RBAC | Register/login/logout/refresh, profile, Guest/User/Admin RBAC middleware, protected route tests |
| P2 | Core Catalog | Design parent model + House Plan/Elevation/Interior details, Category/Style/Tag/Amenity, admin CRUD, media upload pipeline |
| P3 | Discovery | Listing pages, filters, sort, free-text search parsing, favourites, similar/related designs |
| P4 | Services & Leads | Services/packages, enquiry form, consultation form, admin lead management (status pipeline) |
| P5 | Content + SEO | Blog, FAQs, curated SEO landing pages, dynamic metadata, JSON-LD, canonical, segmented sitemaps, robots, breadcrumbs, redirects |
| P6 | Performance | CDN + image optimization pipeline live end-to-end, caching/ISR tuning, DB index audit based on real query patterns, bundle optimization, Lighthouse CI budgets green |
| P7 | QA & Hardening | Unit (Vitest) + E2E (Playwright) coverage of critical flows, RBAC test suite, SEO crawl validation, responsive + accessibility pass, basic load testing, security/edge-case audit, launch checklist |

Each phase ends with a short internal demo/review before moving to the next; schema/API changes are expected mainly in P0–P2 and should be largely stable by P3 onward to avoid rework.

## Testing & Edge-Case Strategy

- **Data edge cases**: designs with missing optional fields (no budget, no Vastu flag), zero-result filter combinations, duplicate slugs, very large galleries, unpublished designs accessed directly by ID/slug (must 404 for non-admins).
- **Form edge cases**: enquiry/consultation spam (rate limiting + honeypot/validation), invalid phone/email formats, oversized uploads, unsupported file types.
- **Auth edge cases**: expired/rotated refresh tokens, concurrent logins, role changes mid-session.
- **SEO edge cases**: thin/combinatorial filter URLs (must be `noindex` or not generated at all), duplicate content across near-identical landing pages (must have unique copy), broken canonical chains.
- **Performance edge cases**: designs with 30+ high-resolution gallery images (must still hit LCP/CLS targets via lazy loading and fixed aspect-ratio containers).

## Deployment & Environment

- Environments: `local → staging → production`, each with isolated PostgreSQL instance and object storage bucket/prefix.
- CI: lint + typecheck + unit tests + Playwright smoke suite + Lighthouse CI budget check on every PR; full E2E suite on merge to main.
- Environment variables (non-exhaustive): `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `OBJECT_STORAGE_*`, `CDN_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `RATE_LIMIT_*`, `NODE_ENV`.
- Migrations via Prisma Migrate, applied as a distinct CI/CD step before app deploy; rollback plan documented per release.
