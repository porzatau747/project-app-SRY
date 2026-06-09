# Project Directory Map

## Root Directory
- `.agent/`: Agent workflows and skills (e.g., debugging, writing).
- `.ai/`: AI context documentation.
- `apps/`: The main monorepo applications.
- `packages/`: Shared packages (e.g., `database`).
- `data/`: The local file-based database directory (ignored by git, contains `planner-state.json`).
- `scratch/` & `scripts/`: Development scripts and testing grounds.
- `TBINS/`: Deprecated or alternative route binaries.
- `*.py`, `*.js`: Various standalone scraping and utility scripts.

## `apps/web-app` (Main Application)
- **`src/app/`**: Next.js App Router root.
  - `api/`: Backend API routes (`generate-content`, `sync-stock`, `scrape-advice`, etc.).
  - `content-creator/`, `guide/`, `promotion-combo/`, `trend-planner/`: Feature pages.
  - `PlannerApp.tsx`: Main entry point for the Stock Planner UI.
- **`src/components/`**: React UI components.
  - `planner/`: Dashboard, tables, calendars.
  - `trend-planner/`: News cards, radar lists.
  - `virtual-office/`: A pixel-art style interactive UI.
- **`src/services/`**: Core business logic.
  - `ai.ts`: Google Gemini integration.
  - `storage.ts`: File-based database controller.
  - `trend-analyzer.ts`, `trend-fetcher.ts`: Logic for analyzing scraped trends.
- **`src/hooks/`**: React Query and custom hooks.
- **`src/types/`**: TypeScript interfaces (`planner.ts`).
- **`src/store/`**: Zustand global state (`uiStore.ts`).
- **`src/pixel-engine/`**: A custom 2D canvas engine for the Virtual Office feature.

## `apps/scraping-worker`
- **`src/stock-scraper.ts`**: The main worker script that pulls inventory data.
