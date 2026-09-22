# Database Schema (PostgreSQL + Prisma)

## 1. ER Summary

```
User 1───* RefreshSession
User 1───* Favorite *───1 Design
User 1───* Enquiry
User 1───* ConsultationRequest
User 1───* Project

Design (parent) 1───1 HousePlanDetails | ElevationDetails | InteriorDetails   (by Design.type)
Design *───1 Category
Design *───1 Style
Design 1───* DesignMedia
Design *───* Amenity   (via DesignAmenity)
Design *───* Tag       (via DesignTag)
Design 1───* Favorite

Service 1───* ServicePackage
Service 1───* Enquiry

ConsultationRequest *───1 User (nullable, guest allowed)
Project 1───* ProjectFile
Project *───1 User
Project *───1 Service (nullable)

BlogPost *───1 BlogCategory

SeoLandingPage *───1 Category (optional link to a curated filter set)

MediaAsset  (generic media library, referenced by DesignMedia, BlogPost, etc.)
```

## 2. Entities

### User
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | string | |
| email | string, unique | |
| passwordHash | string | |
| role | enum(GUEST is implicit/USER, ADMIN) | default USER |
| phone | string, nullable | |
| avatarUrl | string, nullable | |
| createdAt / updatedAt | timestamp | |

### RefreshSession
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId | FK → User | |
| tokenHash | string | hashed refresh token |
| userAgent / ip | string | |
| expiresAt | timestamp | |
| revokedAt | timestamp, nullable | |

### Design (parent entity)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| type | enum(HOUSE_PLAN, ELEVATION, INTERIOR) | |
| title | string | |
| slug | string, unique | indexed |
| shortDescription | string | for cards/listing |
| description | text | |
| status | enum(DRAFT, PUBLISHED, ARCHIVED) | indexed |
| featured | boolean | default false |
| categoryId | FK → Category, nullable | indexed |
| styleId | FK → Style, nullable | indexed |
| seoTitle / seoDescription | string, nullable | |
| publishedAt | timestamp, nullable | |
| createdAt / updatedAt | timestamp | |

### HousePlanDetails (1:1 with Design where type=HOUSE_PLAN)
| Field | Type | Notes |
|---|---|---|
| designId | FK → Design, PK | |
| plotWidth / plotDepth | decimal | plus `unit` (FT/M) |
| unit | enum(FT, M) | |
| facing | enum(N,S,E,W,NE,NW,SE,SW) | indexed |
| bhk | int | indexed |
| floors | string | e.g. "G", "G+1", "G+2" |
| bathrooms | int | |
| parking | boolean | |
| vastuCompliant | boolean | indexed |
| plotType | enum(REGULAR, CORNER) | |
| builtUpAreaSqft | decimal | |
| budgetMin / budgetMax | decimal, nullable | |

### ElevationDetails (1:1, type=ELEVATION)
| Field | Type | Notes |
|---|---|---|
| designId | FK → Design, PK | |
| floors | string | |
| plotWidth | decimal | |
| facing | enum | |
| styleTag | string | e.g. modern/contemporary/colonial |

### InteriorDetails (1:1, type=INTERIOR)
| Field | Type | Notes |
|---|---|---|
| designId | FK → Design, PK | |
| roomType | enum(LIVING_ROOM, BEDROOM, KITCHEN, BATHROOM, POOJA_ROOM, OTHER) | indexed |
| styleTag | string | |

### DesignMedia
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| designId | FK → Design | indexed |
| mediaAssetId | FK → MediaAsset | |
| kind | enum(GALLERY, FLOOR_PLAN, COVER) | |
| sortOrder | int | |

### Category / Style / Amenity / Tag (+ join tables DesignAmenity, DesignTag)
Standard lookup tables: `id, name, slug, description?`. Join tables: `designId + amenityId` / `designId + tagId` composite PK.

### Favorite
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId | FK → User | |
| designId | FK → Design | |
| createdAt | timestamp | |
| — | unique(userId, designId) | |

### Service
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name / slug | string | |
| description | text | |
| status | enum(ACTIVE, INACTIVE) | |
| seoTitle / seoDescription | string, nullable | |

### ServicePackage
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| serviceId | FK → Service | |
| name | string | e.g. "Basic Floor Plan", "Premium 3D Elevation" |
| priceFrom | decimal, nullable | |
| features | string[] / json | |

### Enquiry
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId | FK → User, nullable | guest allowed |
| designId | FK → Design, nullable | |
| serviceId | FK → Service, nullable | |
| name / email / phone | string | |
| message | text | |
| status | enum(NEW, CONTACTED, IN_PROGRESS, CLOSED) | indexed |
| createdAt | timestamp | |

### ConsultationRequest
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId | FK → User, nullable | |
| plotWidth / plotDepth | decimal, nullable | |
| budgetRange | string, nullable | |
| requirementDetails | text | |
| preferredContactTime | string, nullable | |
| status | enum(NEW, SCHEDULED, COMPLETED, CANCELLED) | indexed |
| createdAt | timestamp | |

### Project (post-enquiry lifecycle — may ship v1.1)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId | FK → User | |
| serviceId | FK → Service, nullable | |
| title | string | |
| status | enum(REQUIREMENT, ASSIGNED, IN_PROGRESS, REVIEW, REVISION, APPROVED, DELIVERED) | |
| createdAt / updatedAt | timestamp | |

### ProjectFile
`id, projectId (FK), mediaAssetId (FK), label, uploadedAt`

### BlogPost / BlogCategory
Standard CMS fields: `title, slug, excerpt, content, coverImageId, categoryId, status, seoTitle, seoDescription, publishedAt`.

### SeoLandingPage
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| path | string, unique | e.g. `/house-plans/30x50` |
| title / h1 | string | |
| intro / content | text | supporting unique copy to avoid thin content |
| filterConfig | json | which Design query this page renders |
| seoTitle / seoDescription | string | |
| status | enum(DRAFT, PUBLISHED) | |

### FAQ, Testimonial
Simple content tables scoped optionally to a `designId` or `serviceId`.

### MediaAsset
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| originalUrl | string | |
| variants | json | `{ thumb, medium, large, webp, avif }` URLs |
| altText | string, nullable | |
| width / height | int | |
| uploadedById | FK → User | |

### SiteSetting
Key-value table for global config (site name, contact info, social links, default SEO fields, feature flags).

### AuditLog
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| actorId | FK → User | |
| action | string | e.g. `design.publish`, `enquiry.status_change` |
| entityType / entityId | string | |
| metadata | json | diff/context |
| createdAt | timestamp | |

## 3. Indexing Notes

Baseline indexes: unique `slug` on `Design`, `SeoLandingPage.path`, `User.email`; standard FK indexes on all join/child tables; `status` + `publishedAt` composite on `Design` for listing queries; `facing`/`bhk`/`plotWidth`/`plotDepth` on `HousePlanDetails` for filter queries; `pg_trgm` GIN index on `Design.title`/`shortDescription` for free-text search. Final composite indexes to be confirmed after reviewing real query patterns in P2/P3 (see PROJECT_PLAN.md) — not over-indexed speculatively.
