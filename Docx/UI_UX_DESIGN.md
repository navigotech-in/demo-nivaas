# UI / UX Design Specification

Design direction: **minimal, whitespace-heavy, image-forward, discovery-first, progressive disclosure.** Functionally comparable to the reference (makemyhouse.com), visually and structurally original — different navbar/sidebar treatment, different card system, different color palette, simplified information density per page.

## 1. Navigation

**Desktop navbar:**
`Logo | House Plans | Elevations | Interiors | Services | Inspiration      🔍 Search   ♡ Saved   Account`

- "Explore" is not a dumping ground — each primary category is its own top-level nav item.
- Sticky, minimal height, transparent-over-hero on Home, solid on scroll/other pages.

**Mobile:** hamburger → slide-in panel with the same top-level items; search is a persistent icon in the mobile top bar; filters on listing pages open as a bottom sheet rather than an inline sidebar.

**Listing pages (desktop):** left filter sidebar (sticky) + right card grid (responsive 2/3/4 columns by breakpoint).

## 2. Design System Tokens

### Color (light mode)
| Token | Value (example) | Use |
|---|---|---|
| `--bg-base` | off-white / stone (#FAF8F5) | page background |
| `--bg-surface` | white (#FFFFFF) | cards |
| `--text-primary` | charcoal (#22221F) | body/headings |
| `--text-secondary` | warm gray (#6B675F) | meta text |
| `--accent` | single restrained accent (e.g. terracotta/clay #B3552B or deep forest #2F4B3C — final pick at brand stage) | CTAs, active filter chips, links |
| `--border` | #E7E3DC | card/section borders (subtle) |

### Color (dark mode)
| Token | Value (example) |
|---|---|
| `--bg-base` | #171613 |
| `--bg-surface` | #201F1B |
| `--text-primary` | #F3F1EC |
| `--text-secondary` | #A8A398 |
| `--accent` | same hue, lightened for contrast |
| `--border` | #322F29 |

### Typography
- Headings: a humanist serif or grotesk-sans with character (distinct from generic system sans) — e.g. pairing a serif display face for H1/H2 with a clean sans for body/UI.
- Body/UI: system-leaning sans (e.g. Inter-class) for legibility at small sizes.
- Scale: `text-xs 12 / sm 14 / base 16 / lg 18 / xl 20 / 2xl 24 / 3xl 30 / 4xl 36 / 5xl 48`.

### Spacing & Layout
- 4px base spacing scale (4/8/12/16/24/32/48/64/96).
- Max content width ~1280px; generous section vertical rhythm (64–96px between homepage sections).
- Card radius: moderate (8–12px), shadows minimal (`0 1px 2px` resting, slightly deeper on hover).

### Breakpoints
`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536` (Tailwind defaults, used as-is).

## 3. Page-by-Page Breakdown

| Page | Contains | Key components |
|---|---|---|
| Home | Hero + search, popular plot sizes, featured house plans, featured elevations, interior inspiration strip, services overview, featured projects, guides/blog teaser, consultation CTA, footer | Hero, SearchBar, CategoryChips, DesignCardGrid, ServiceCardGrid, BlogTeaser, CTASection |
| House Plans Listing | Filter sidebar (plot size, facing, BHK, floors, bathrooms, parking, Vastu, plot type, style, budget), sort, result grid, pagination | FilterSidebar, SortDropdown, DesignCard, Pagination, MobileFilterSheet |
| Elevations Listing | Filters (floors, plot width, style, facing), grid | Same components, scoped filter set |
| Interiors Listing | Room-type filter chips, style filter, grid | RoomTypeChips, DesignCard |
| Design Detail (unified) | Gallery, spec table (dimensions/BHK/floors/facing/parking/Vastu), description, features list, similar designs, related elevations/interiors, Save/Share, enquiry CTAs, breadcrumbs, FAQ (if any) | Gallery, SpecTable, SimilarDesigns, EnquiryCTA, Breadcrumbs, FAQAccordion |
| Services Listing | Service cards (Floor Plan, 3D Elevation, Structural, Working Drawings, Electrical, Plumbing, Interior Design, Vastu, Custom Design) | ServiceCard grid |
| Service Detail | Description, package options, "Request Consultation" form | PackageCards, ConsultationForm |
| Search Results | Parsed-query summary, filter sidebar, grid, noindex state for thin combos | SearchSummary, FilterSidebar, DesignCard |
| Auth (Login/Register) | Minimal centered form | AuthForm |
| Dashboard — Overview | Quick stats (saved count, open enquiries), recent activity | StatCard |
| Dashboard — Saved | Grid of favourited designs | DesignCard, EmptyState |
| Dashboard — Enquiries/Consultations | Status-tagged list | StatusList |
| Dashboard — Profile | Editable profile form | ProfileForm |
| Admin — Dashboard | Key counts (designs, leads this week, etc.) | AdminStatCard |
| Admin — Designs (list/edit) | Table + filters, multi-step create/edit form (common fields → type-specific fields → media → SEO → publish) | AdminTable, MultiStepForm, MediaUploader |
| Admin — Services | CRUD table + package sub-editor | AdminTable |
| Admin — Enquiries/Consultations | Table with status pipeline, detail drawer, notes | AdminTable, StatusPipeline, DetailDrawer |
| Admin — Users | Table, role management | AdminTable |
| Admin — Categories/Tags/Styles/Amenities | Simple CRUD tables | AdminTable |
| Admin — Blog/Guides | CRUD + rich text editor | AdminTable, RichTextEditor |
| Admin — SEO Pages | CRUD, filterConfig builder, preview | AdminTable, FilterConfigBuilder |
| Admin — FAQs/Testimonials | CRUD tables | AdminTable |
| Admin — Media Library | Grid, upload, usage indicator | MediaGrid, Uploader |
| Admin — Site Settings | Key-value settings form | SettingsForm |
| Admin — Audit Log | Read-only filtered table | AdminTable |

## 4. Admin Sidebar

```
Dashboard
Designs
 ├ House Plans
 ├ Elevations
 └ Interiors
Services
Enquiries
Consultations
Users
Categories / Styles / Tags / Amenities
Media Library
Blog / Guides
SEO Pages
FAQs
Testimonials
Site Settings
Audit Log
```

## 5. Component Library (shared primitives)

Button, Input, Select, Checkbox/Radio, RangeSlider (plot size/budget), Chip/Tag, Card (DesignCard variant + generic Card), Modal, Drawer/BottomSheet, Tabs, Accordion, Breadcrumbs, Pagination, Badge (status), Toast/Notification, DataTable (admin), RichTextEditor wrapper, ImageGallery/Lightbox, StatCard, EmptyState, Skeleton loaders.

## 6. Responsive & Accessibility Notes

- All interactive controls keyboard-navigable; visible focus states use `--accent`.
- Filter sidebar collapses to a bottom sheet under `md`; sort/filter controls remain reachable via a sticky mini-bar on mobile listing pages.
- Images always have descriptive `alt` text (driven by `MediaAsset.altText`, admin-editable).
- Color contrast meets WCAG AA for text on `--bg-base`/`--bg-surface` in both light and dark themes.
