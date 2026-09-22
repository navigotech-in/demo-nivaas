# User & Admin Flows

## 1. Guest — Browse & Search
```
Land on Home
  → enter search ("30x50 east facing") OR click a category (House Plans/Elevations/Interiors)
  → Listing page renders (SSR/ISR initial + client-side filter updates via TanStack Query)
  → apply filters (plot size, facing, BHK, floors, style, Vastu)
  → click a Design card
  → Design Detail page
  → [Save (prompts login if guest)] / [Share] / [Request customization] / [Talk to architect]
```

## 2. Registration / Login
```
Click Account → Register
  → name, email, password (Zod-validated) → submit
  → account created, JWT access + refresh issued
  → redirect to previous page or Dashboard

Click Account → Login
  → email + password → submit
  → on success: access + refresh issued → redirect
  → on failure: inline error, rate-limited after repeated failures
```

## 3. Design Detail → Enquiry
```
On Design Detail page → "Request customization" or "Talk to an architect"
  → Enquiry form opens (name, email, phone, message; pre-filled designId + type)
  → client validation (React Hook Form + Zod) → submit → POST /enquiries
  → success state shown; if logged in, appears under Dashboard → My Enquiries
  → Admin sees it in Admin → Enquiries (status: NEW)
```

## 4. Consultation Request (service-led, not tied to a specific design)
```
Services page → select a service → Service Detail
  → "Request Consultation" → form (plot details, budget range, requirement details, preferred contact time)
  → submit → POST /consultations
  → confirmation shown; Admin sees it in Admin → Consultations (status: NEW)
  → Admin updates status: NEW → SCHEDULED → COMPLETED (or CANCELLED)
  → status visible to user in Dashboard → Consultation Requests
```

## 5. Save / Favourite
```
Guest clicks ❤ on a card/detail page → prompted to login/register
  → after auth, action is completed automatically (intended favorite is retried)
User clicks ❤ → POST /users/me/favorites/:designId → optimistic UI update
Dashboard → Saved Designs → lists all favourites, unsave available
```

## 6. Admin — Publish a New Design
```
Admin → Designs → New
  → choose type (House Plan / Elevation / Interior)
  → fill common fields (title, slug auto-suggested, description, category, style, SEO title/description)
  → fill type-specific fields (dimensions/facing/BHK/floors for House Plan, etc.)
  → upload media (cover, gallery, floor plan) → pipeline generates optimized variants
  → save as Draft → preview
  → Publish → status=PUBLISHED, publishedAt set, ISR revalidation triggered for
     listing pages + relevant SEO landing pages + sitemap regeneration queued
```

## 7. Admin — Manage Leads (Enquiries/Consultations)
```
Admin → Enquiries (or Consultations)
  → filter by status/date/design/service
  → open a lead → view details → update status (NEW → CONTACTED → IN_PROGRESS → CLOSED)
  → add internal notes
  → (optional) convert to Project record for lifecycle tracking
  → action logged to AuditLog
```

## 8. Admin — Create a Curated SEO Landing Page
```
Admin → SEO Pages → New
  → define path (e.g. /house-plans/25x40-duplex)
  → define filterConfig (which Design query this page should render)
  → write unique intro/content copy (avoids thin/duplicate content)
  → set SEO title/description → Publish
  → page becomes statically generated + added to sitemap-house-plans.xml
```

## 9. Free-text Search Resolution
```
User types "30x50 east facing duplex" in global search
  → query parser extracts: plotWidth=30, plotDepth=50, facing=EAST, styleTag~duplex
  → if an exact curated SeoLandingPage.filterConfig matches → redirect to that landing page (best SEO outcome)
  → else → render filtered /designs results with noindex (thin/combinatorial state)
```
