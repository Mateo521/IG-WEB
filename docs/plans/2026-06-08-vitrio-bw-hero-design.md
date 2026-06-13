# Vitrio — Black & White Minimalist Redesign

## Overview
Full B&W monochrome redesign of the industrial catalog hero section, featuring a Three.js-based ASCII text animation for the brand name "VITRIO".

## Design System

### Colors
| Role | Value | Usage |
|------|-------|-------|
| Background | `#000000` | Page/hero background |
| Surface | `#18181B` | Cards, sidebar, inputs |
| Surface Hover | `#27272A` | Card hover |
| Text Primary | `#FAFAFA` | Headings, body |
| Text Muted | `#A1A1AA` | Subtitles, metadata |
| Text Faint | `#52525B` | Placeholder, disabled |
| Border | `#27272A` | Card/input borders |
| Border Hover | `#3F3F46` | Input hover |
| CTA Text | `#000000` | Button text on white bg |

### Typography
- **Headings (hero)**: Anton, sans-serif (kept from original for "VITRIO" label)
- **ASCII text**: IBM Plex Mono (used by Three.js component)
- **Body**: Hind, sans-serif (unchanged)

### Effects
- ASCIIText: Three.js rendered ASCII text with wave distortion + mouse tracking
- Cards: border-based hover (white border on hover), no color accents
- All orange references removed

### Anti-patterns avoided
- No emojis
- No color-only indicators
- No backdrop-filter blur on topBar
- No gradient backgrounds
