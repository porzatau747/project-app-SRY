# System Architecture

## High-Level Architecture
This is a Monorepo system with two main applications:
1. **`apps/web-app`**: The primary user interface and API backend built on Next.js.
2. **`apps/scraping-worker`**: A background worker that pulls data from external sources.

The system uses a **File-based Architecture** for data persistence rather than a traditional SQL/NoSQL database, utilizing the shared `data/` directory at the project root.

## Components & Modules

### 1. Data Ingestion (Scraping Worker)
- **Location**: `apps/scraping-worker/src/stock-scraper.ts`, Python scripts in root (`scrape_fb.py`, etc.)
- **Role**: Periodically fetches market prices, competitors' posts, and IT news.
- **Output**: Writes JSON files directly to the root `data/` directory.

### 2. State & Storage Layer
- **Location**: `apps/web-app/src/services/storage.ts`
- **Role**: Reads and writes `data/planner-state.json`.
- **Data Models**:
  - `inventory`: Array of `InventoryItem` (Product code, name, qty, stockValue, etc.)
  - `summary`: `InventorySummary` (Total SKU, stock value, projected revenue)
  - `weeklyPlan`: Array of `WeeklyPlanPost`
  - `analysis`: Trend analysis and insights
- **Client Storage**: `src/utils/historyUtils.ts` uses `localStorage` for campaign history.

### 3. API & Backend Services (Next.js API Routes)
- **Location**: `apps/web-app/src/app/api/...`
- **Endpoints**:
  - `/api/sync-stock`: Triggers stock synchronization.
  - `/api/scrape-advice`: Fetches central pricing for specific items.
  - `/api/generate-weekly-plan`, `/api/generate-trend-plan`, `/api/generate-content`: Interfaces with the AI Service.
  - `/api/update-trends`: Triggers trend fetching.

### 4. AI Service Layer
- **Location**: `apps/web-app/src/services/ai.ts`
- **Role**: Integrates with Google Gemini.
- **Models**: Uses `gemini-2.5-flash` for fast data structuring (stock analysis) and `gemini-2.5-pro` for creative content generation.

### 5. Frontend Presentation (Next.js UI)
- **Location**: `apps/web-app/src/app/...`
- **Entry Points**: 
  - `PlannerApp.tsx` (Stock-based planning)
  - `TrendPlannerApp.tsx` (Trend-based planning)
  - `PromotionComboApp.tsx`
  - `ContentCreatorApp.tsx`
- **State Management**: Uses `useInventoryQuery.ts`, `useTrendQuery.ts` (React Query) and `uiStore.ts` (Zustand).

### 6. Promotion Content Module
- **Location**: `apps/web-app/src/app/promotions`, `apps/web-app/src/services/promotion-*.ts`
- **Role**: Builds Canva-ready promotion content from existing stock and market price data without changing the stock collector or pricing system.
- **Source of Truth**: Reads `readPlannerState().inventory`; does not write to `planner-state.json`.
- **Storage**: Uses separate file storage at `data/promotion-batches.json` for review batches.
- **Review Flow**: User selects candidates -> generates safe Thai copy -> approves/rejects items -> exports Canva Bulk Create CSV.
- **Database Readiness**: Prisma models `PromotionBatch`, `PromotionItem`, and `PromotionExport` exist for future database-backed storage.

## Data Flow
1. **Ingest**: Workers scrape data -> save to `data/*.json`.
2. **Load**: UI mounts -> calls Next.js API -> `storage.ts` reads `planner-state.json` -> returns to UI via React Query.
3. **Action**: User clicks "Generate" -> UI POSTs to Next.js API -> API calls `ai.ts` with inventory/trend data.
4. **Generate**: Gemini returns structured JSON content -> API formats it -> `storage.ts` saves to `planner-state.json` -> API returns success.
5. **Update**: UI React Query invalidates and refetches fresh state.
6. **Promotion Export**: Promotion module reads inventory -> creates batch copy -> stores review state separately -> exports approved rows to Canva CSV.
