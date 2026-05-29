# High-End Frontend Redesign - Design Document

**Date:** 2026-05-29
**Style:** High-End Visual Design (Ethereal Glass + Asymmetrical Bento Grid)

## 1. Vibe & Texture
- **Theme:** Ethereal Glass (SaaS / AI Style)
- **Colors:** OLED Black (`#050505`) with mesh gradients (e.g. glowing purple/teal).
- **Typography:** Grotesk/Geometric premium fonts via Google Fonts (e.g., Plus Jakarta Sans).
- **Backgrounds:** Vantablack cards with heavy blur effects.

## 2. Layout Architecture
- **Theme:** The Asymmetrical Bento Grid.
- **Structure:** Masonry-like CSS Grid of varying card sizes instead of uniform boxes.
- **Mobile Fallback:** Single-column stack with generous vertical gaps below `768px`.
- **Spacing (Macro-Whitespace):** Generous padding for sections to let the UI breathe.

## 3. Component Details
- **Double-Bezel Architecture:** Outer shell (light border, padding, subtle background) + Inner core with inner shadow and distinct background color.
- **Nested CTA / Island Buttons:** Fully rounded pill buttons with a nested circular wrapper for trailing icons.
- **Eyebrow Tags:** Precede major headings with a pill-shaped badge.

## 4. Motion Choreography
- **Transitions:** Use custom cubic-beziers (`ease: cubic-bezier(0.32,0.72,0,1)`).
- **Scroll Entry:** Elements fade up gently when entering the viewport.
- **Button Physics:** Hovering scales down slightly (`transform: scale(0.98)`) with internal kinetic tension.
- **Fluid Nav:** Floating glass pill nav that morphs beautifully.
