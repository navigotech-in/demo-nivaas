# Indore House Makers — UI / UX Design Specification

**Design Philosophy**: Architectural elegance, earthy warmth, high-contrast readability, clean SVG iconography, and responsive mobile-first craftsmanship.

---

## 1. Color Palette & Design Tokens

### Light Theme (Core Brand)
| Token | Hex Value | Usage |
|---|---|---|
| `--bg-base` | `#FAF8F5` / `#FDFCF9` | Primary page background, warm natural limestone tone |
| `--bg-surface` | `#FFFFFF` | Card surfaces, modal sheets, dropdown menus |
| `--text-primary` | `#1A1815` / `#292826` | Main headings, titles, high-contrast labels |
| `--text-secondary`| `#54504A` / `#74706A` | Subtext, descriptions, metadata |
| `--accent-primary`| `#E76F2E` | Primary action buttons, active badges, highlights |
| `--accent-terracotta`| `#C94F36` | Secondary accent, brand marks, CTA buttons |
| `--border-subtle` | `#E7E0D7` / `#EEE9E3` | Subtle card borders, dividers |

### Component Iconography Standards
- **Zero Cartoon Emojis**: All decorative and functional icons use clean, modern Lucide React SVGs (`Icons.Sparkles`, `Icons.Grid`, `Icons.Layers`, `Icons.Sun`, `Icons.Moon`, `Icons.Blueprint`, `Icons.Check`, `Icons.Phone`, etc.).
- **High-Contrast Text**: Option cards utilize `font-extrabold text-base text-[#1A1815]` for immediate scannability.

---

## 2. Navigation Architecture

### 2.1 Mobile Bottom Navigation (0–767px)
- Fixed full-width bottom bar (`fixed bottom-0 left-0 right-0 h-16 bg-[#FDFCF9] z-[99980]`).
- 5 Core tabs: **Home**, **Plans**, **Studio (AI)**, **Designs**, **Menu**.
- Smooth animated bottom sheet drawer (`#explore-ihm-sheet`) with quick access to User Login, Services, AI Studio, and Consultations.

### 2.2 Tablet Floating Dock (768–1023px)
- Centered compact dock (`fixed bottom-5 left-1/2 -translate-x-1/2 min-w-[480px] max-w-[580px] rounded-lg shadow-lg`).

### 2.3 Desktop Header (1024px+)
- Sticky top navigation with Logo, House Plans, 3D Elevations, Interiors, Cost Estimator, AI Studio CTA, and User Account button.

---

## 3. Modal & Card Layout Standards

### 3.1 AI Architect Studio Modal
- **Container Sizing**: Fixed stable dimensions across all tabs (`max-w-3xl lg:max-w-4xl h-[88vh] max-h-[780px] min-h-[560px]`).
- **No Layout Shift**: Tab switching between "AI Plan Generator" and "Ask AI Architect (Chat)" keeps identical outer container boundaries.
- **Progress Header**: Dynamic step bar (`Step X of 20` or `Step X of 23`) with category breadcrumb and percentage indicator.

### 3.2 User Panel (Phase 2 Specifications)
- **Mobile-First Responsive Layout**: Sidebar on desktop, top tab navigation / drawer on mobile.
- **Dashboard Sections**:
  1. **Profile & Pass Header**: User name, email, phone, and active ₹299 pass badge with remaining credits.
  2. **My Projects Grid**: Card view of generated plans with room dimensions, facing, and PDF download button.
  3. **Saved Favorites**: Grid of bookmarked catalog house plans.
  4. **Consultations Status**: Timeline tracker for booked architect consultations (`Scheduled`, `In Review`, `Completed`).
  5. **Credit Ledger History**: Clean table/list displaying every ledger transaction with timestamp and delta badge (`+5 GRANT`, `-1 RESERVE`, `+1 REFUND`).
  6. **Empty States**: High-quality visual empty states with action CTAs (e.g. "Create your first house plan").

### 3.3 Admin Panel (Phase 3 Specifications)
- **Desktop-Focused Control Center**: Collapsible sidebar, metrics summary row, data table with filters, search, and status dropdowns.
