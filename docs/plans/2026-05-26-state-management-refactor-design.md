# State Management Refactoring Design

**Date:** 2026-05-26
**Topic:** Separating Server and Client State using React Query and Zustand
**Status:** Approved

## Overview
The goal of this refactor is to improve the state management architecture of the Weekly Content Planner application. Currently, all state (both server data and UI state) is heavily mixed within custom hooks (`usePlanner`, `useTrendPlanner`), making it difficult to maintain and scale. 

We will adopt a "Strangler Fig" incremental refactoring approach to safely migrate to:
1. **React Query:** For managing Server State (data fetching, caching, loading/error states).
2. **Zustand:** For managing Client State (UI states, user preferences, selections).

## Architectural Strategy: Strangler Fig Approach
Instead of a "Big Bang" rewrite that might break the existing UI, we will keep the existing component interfaces intact as much as possible. We will wrap the existing logic and replace the internals of `usePlanner` and `useTrendPlanner` incrementally.

### 1. Server State (React Query)
We will introduce `@tanstack/react-query` to handle API interactions.
- `useInventoryQuery`: Replaces raw `fetch` for fetching the stock and pricing data.
- `useTrendPlanQuery`: Replaces raw `fetch` for the auto-generated trend plan.
- `useGenerateContentMutation`: Replaces raw `fetch` POST requests for AI prompt generation, taking advantage of React Query's `onSuccess` and `onError` callbacks to trigger our existing `react-hot-toast` notifications.

### 2. Client State (Zustand)
We will introduce `zustand` to manage global UI state without prop drilling.
- `useUIStore`: Will hold UI states that need to be accessed across components without re-fetching data. Examples include:
  - `activeTab` (News vs Tips in Trend Planner)
  - `prompt` and `template` (in AI Content Creator)
  - `dndReady` or layout states.
- `usePreferencesStore`: (Future extension) Will hold user preferences like theme or table filter settings.

## Implementation Steps
1. **Setup:** Install `@tanstack/react-query` and `zustand`. Configure the `QueryClientProvider` in `layout.tsx`.
2. **Client State Migration:** Create `src/store/uiStore.ts`. Migrate the purely UI-driven states out of the components/hooks and into Zustand.
3. **Server State Migration (Phase 1):** Create React Query mutations for the AI Content generation since it's the most isolated feature.
4. **Server State Migration (Phase 2):** Convert the data fetching in `usePlanner` and `useTrendPlanner` to use `useQuery`.
5. **Cleanup:** Remove legacy state and fetch logic. Ensure all tests and TypeScript checks pass.

## Trade-offs Considered
- **Big Bang Refactor vs Strangler Fig:** A complete rewrite would result in cleaner code immediately but carries a high risk of breaking the app. The incremental approach minimizes risk and allows us to verify the application screen by screen, although it may lead to a temporary mix of old and new state paradigms during the transition. The incremental approach was chosen and approved.

## Testing & Verification
- Compile check using `npx tsc --noEmit` after each major migration phase.
- Manual UI testing to ensure loading states, toast notifications, and data updates function exactly as they did before, but with improved responsiveness and caching.
