# REST API Routes

Base path: `/api/v1`
Auth: `Bearer <accessToken>` header unless noted "public". Roles: `USER`, `ADMIN`.

## Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | public | Create account |
| POST | /auth/login | public | Email+password login → access + refresh (cookie) |
| POST | /auth/refresh | public (cookie) | Rotate refresh token, issue new access token |
| POST | /auth/logout | USER | Revoke refresh session |
| GET | /auth/me | USER | Current user profile |

## Users (self-service)
| Method | Path | Auth | Description |
|---|---|---|---|
| PATCH | /users/me | USER | Update profile |
| GET | /users/me/favorites | USER | List saved designs |
| POST | /users/me/favorites/:designId | USER | Save a design |
| DELETE | /users/me/favorites/:designId | USER | Remove saved design |
| GET | /users/me/enquiries | USER | My enquiries |
| GET | /users/me/consultations | USER | My consultation requests |

## Designs (unified read API; house plans / elevations / interiors share shape)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /designs | public | List/search/filter (type, category, style, bhk, facing, floors, plotWidth/Depth, vastu, sort, page) |
| GET | /designs/:slug | public | Design detail (includes type-specific details, media, similar designs) |
| GET | /designs/:slug/similar | public | Related/similar designs |

## House Plans / Elevations / Interiors (admin write; scoped convenience reads)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /house-plans | public | Filtered list (thin wrapper over /designs?type=HOUSE_PLAN) |
| GET | /elevations | public | Filtered list |
| GET | /interiors | public | Filtered list |
| POST | /admin/designs | ADMIN | Create design (any type) |
| PATCH | /admin/designs/:id | ADMIN | Update design + type-specific details |
| POST | /admin/designs/:id/publish | ADMIN | Publish (sets status, publishedAt, triggers ISR revalidation) |
| DELETE | /admin/designs/:id | ADMIN | Soft delete / archive |
| POST | /admin/designs/:id/media | ADMIN | Attach media (gallery/floor-plan/cover) |
| DELETE | /admin/designs/:id/media/:mediaId | ADMIN | Remove media |

## Taxonomy (Category / Style / Amenity / Tag)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /categories, /styles, /amenities, /tags | public | List for filters |
| POST /PATCH /DELETE | /admin/categories(/:id), /admin/styles(/:id), /admin/amenities(/:id), /admin/tags(/:id) | ADMIN | CRUD |

## Services
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /services | public | List active services |
| GET | /services/:slug | public | Service detail + packages |
| POST /PATCH /DELETE | /admin/services(/:id) | ADMIN | CRUD services & packages |

## Enquiries & Consultations
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /enquiries | public (rate-limited) | Submit enquiry (design or service context) |
| POST | /consultations | public (rate-limited) | Submit consultation request |
| GET | /admin/enquiries | ADMIN | List/filter enquiries |
| PATCH | /admin/enquiries/:id | ADMIN | Update status/notes |
| GET | /admin/consultations | ADMIN | List/filter consultation requests |
| PATCH | /admin/consultations/:id | ADMIN | Update status/notes |

## Projects (v1.1 candidate)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /users/me/projects | USER | My projects |
| GET | /admin/projects | ADMIN | All projects |
| PATCH | /admin/projects/:id | ADMIN | Update status, attach files |

## Blog / Content
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /blog, /blog/:slug | public | List/detail |
| POST /PATCH /DELETE | /admin/blog(/:id) | ADMIN | CRUD |
| GET | /faqs | public | FAQ list (optionally scoped by designId/serviceId) |
| POST /PATCH /DELETE | /admin/faqs(/:id) | ADMIN | CRUD |
| GET | /testimonials | public | List |
| POST /PATCH /DELETE | /admin/testimonials(/:id) | ADMIN | CRUD |

## SEO
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /seo-pages/:path* | public | Resolve a curated SEO landing page config |
| POST /PATCH /DELETE | /admin/seo-pages(/:id) | ADMIN | CRUD curated landing pages |
| GET | /sitemap-index.xml, /sitemap-*.xml | public | Generated sitemaps |
| GET | /robots.txt | public | Robots rules |

## Media
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /admin/media | ADMIN | Upload (validated, triggers variant generation) |
| GET | /admin/media | ADMIN | Media library list |
| DELETE | /admin/media/:id | ADMIN | Remove (blocked if referenced) |

## Admin — Users & Settings & Audit
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /admin/users | ADMIN | List users |
| PATCH | /admin/users/:id | ADMIN | Update role/status |
| GET /PATCH | /admin/settings | ADMIN | Site settings |
| GET | /admin/audit-log | ADMIN | Audit trail |

## Response envelope
```json
// success
{ "success": true, "data": { ... }, "meta": { "page": 1, "pageSize": 20, "total": 134 } }

// error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```
