# Style Redesign: Neumorphism → Flat Minimalist + Parallax

## Overview
Replace the current neumorphic UI (gray-on-gray with dual shadows) with a black/white flat minimalist design accented with orange (`#ea580c`). Add parallax and reveal animations to public-facing pages.

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#fafafa` | Page background |
| `--bg-card` | `#ffffff` | Card/surface background |
| `--bg-dark` | `#f1f5f9` | Darker surface (hover, skeleton) |
| `--text` | `#0f172a` | Primary text |
| `--text-muted` | `#64748b` | Secondary text |
| `--text-faint` | `#94a3b8` | Placeholder/disabled |
| `--primary` | `#ea580c` | Accent (orange) |
| `--primary-hover` | `#c2410c` | Accent hover |
| `--primary-light` | `fff7ed` | Accent background tint |
| `--border` | `#e2e8f0` | Borders and dividers |
| `--danger` | `#ef4444` | Errors/destructive |
| `--success` | `#22c55e` | Success states |

## Shadow System

Replace the 6 neumorphic dual shadows with unidirectional subtle shadows:

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
--shadow:     0 1px 3px rgba(0,0,0,0.08)
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.07)
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.08)
--shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.1)
```

## Component Changes

### Global (`index.css`)
- Replace all color variables
- Remove `--shadow-neu*` and `--shadow-inset*`
- Add new shadow tokens
- Update radii (slightly smaller: 8px default, 4px sm)
- Import Inter font (cleaner modern sans)

### Public Pages
- **NavbarPublico**: White background, bottom border, brand in orange
- **LayoutPublico**: `#fafafa` background
- **Catalogo**: Hero section with gradient + parallax, cards with border+shadow, reveal-on-scroll animations, filters with bordered inputs
- **ProductoDetalle**: White image container with border, bordered inputs + textarea
- **Login/Register**: Centered card with white bg, shadow, bordered inputs
- **SidebarFiltros**: Bordered inputs, no inset shadows
- **Paginacion**: Outline-style buttons, solid active page
- **FloatingIcons**: Add scroll-based Y offset for parallax effect

### Admin Pages
Only token replacement: update CSS variables to new flat palette. No structural or animation changes.

## Parallax & Animations (Public Only)
- **Hero parallax**: Gradient background on catalog that shifts with scroll using `background-position` adjustment
- **Reveal cards**: Intersection Observer API — products fade in + slide up (20px) when scrolled into view
- **FloatingIcons**: Scroll-based Y offset added to existing float animation
- **Smooth transitions**: All interactive elements transition 0.2s ease
