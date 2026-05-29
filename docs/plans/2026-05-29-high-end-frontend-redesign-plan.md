# High-End Frontend Redesign Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Overhaul the Weekly Content Planner's frontend using the high-end-visual-design system (Ethereal Glass + Bento Grid).

**Architecture:** We will update `globals.css` with new CSS variables, premium typography (Plus Jakarta Sans), and motion classes. We will then refactor the main React components in `apps/web-app/src` to adopt the Double-Bezel card architecture, Island CTA buttons, and Asymmetrical Bento Grid layouts. All styling will strictly use Vanilla CSS as per project rules.

**Tech Stack:** Next.js, React, Vanilla CSS

---

### Task 1: Update Global Design Tokens & Typography

**Files:**
- Modify: `apps/web-app/src/app/globals.css`
- Modify: `apps/web-app/src/app/layout.tsx`

**Step 1: Update layout.tsx for Premium Fonts**
Import `Plus Jakarta Sans` from `next/font/google` and apply it to the body.

**Step 2: Rewrite globals.css Base Variables**
Add new color variables for OLED Black (`#050505`), glass borders (`rgba(255,255,255,0.1)`), and cubic-bezier transitions (`cubic-bezier(0.32,0.72,0,1)`).

**Step 3: Commit**
```bash
git add apps/web-app/src/app/globals.css apps/web-app/src/app/layout.tsx
git commit -m "feat(ui): add high-end design tokens and plus jakarta sans"
```

### Task 2: Implement Component CSS Classes (Double-Bezel & Buttons)

**Files:**
- Modify: `apps/web-app/src/app/globals.css`

**Step 1: Add Double-Bezel and Button CSS**
Create `.double-bezel-outer`, `.double-bezel-inner`, `.island-button`, and `.island-button-icon` classes reflecting the haptic micro-aesthetics and magnetic button hover physics.

**Step 2: Commit**
```bash
git add apps/web-app/src/app/globals.css
git commit -m "feat(ui): implement double-bezel and island button css patterns"
```

### Task 3: Refactor Layout & App Shell

**Files:**
- Modify: `apps/web-app/src/app/globals.css`
- Modify: `apps/web-app/src/app/page.tsx` or main wrapper

**Step 1: Create Ethereal Glass Background & Fluid Nav**
Add mesh gradient background to `.appShell` and update `.topNav` to be a floating glass pill (Fluid Island Nav).

**Step 2: Commit**
```bash
git add apps/web-app/src/app/globals.css apps/web-app/src/app/page.tsx
git commit -m "feat(ui): implement ethereal glass background and fluid nav"
```

### Task 4: Apply Bento Grid and Double-Bezel to Trend Planner

**Files:**
- Modify: `apps/web-app/src/app/trend-planner/TrendPlannerApp.tsx`
- Modify: Sub-components (e.g. `TrendDashboard.tsx`, `NewsAndTipsList.tsx`)
- Modify: `apps/web-app/src/app/globals.css`

**Step 1: Update Grids to Asymmetrical Bento**
Modify CSS grids (like `.gridTwo`, `.calendarGrid`) to allow uneven spans (`grid-column: span 2`) and large gaps (`gap: 24px`). Ensure mobile collapse to 1 column.

**Step 2: Refactor Cards**
Wrap existing cards in `div.double-bezel-outer > div.double-bezel-inner`. Change buttons to `island-button`.

**Step 3: Commit**
```bash
git add apps/web-app/src/app/trend-planner/
git add apps/web-app/src/app/globals.css
git commit -m "feat(ui): apply bento grid and double-bezel cards to trend planner"
```

### Task 5: Add Scroll Interpolation & Micro-Animations

**Files:**
- Create: `apps/web-app/src/components/ui/FadeUpReveal.tsx`

**Step 1: Create Scroll Reveal Component**
Use IntersectionObserver in React to add a `.reveal-visible` class that transitions `opacity` and `transform: translateY` using the custom cubic-bezier.

**Step 2: Wrap major sections**
Wrap the bento grid cards in `<FadeUpReveal>` in `TrendPlannerApp.tsx`.

**Step 3: Commit**
```bash
git add apps/web-app/src/components/ui/FadeUpReveal.tsx apps/web-app/src/app/trend-planner/TrendPlannerApp.tsx
git commit -m "feat(ui): add scroll interpolation motion choreography"
```
