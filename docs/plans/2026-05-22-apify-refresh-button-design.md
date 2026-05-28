# Apify Refresh Button Design
**Date:** 2026-05-22
**Topic:** Separating Apify Scraping and Plan Generation in the Trend Planner

## Context
In the "Trend Planner" page (แผนจากเทรนด์), the "Generate" button currently serves to generate the 7-day content plan using the existing JSON data (`data/apify_fb_posts.json`). The user wants to pull fresh data from Apify on demand, but running the Apify scraper takes 1-2 minutes.

## Decision
To provide the best UX, we will separate the "Data Refresh" logic from the "Plan Generation" logic.

## Architecture & UI
1. **UI Components (`src/app/trend-planner/TrendPlannerApp.tsx`):**
   - We will introduce a new "อัปเดตข้อมูลจากเพจ" (Update Data from Page) button right next to the existing "Generate แผนเทรนด์ 7 วัน" button.
   - These two buttons will be grouped together visually.
   - When the update button is clicked, it enters a `loading` state indicating that the scraping is in progress (takes ~1-2 mins).

2. **Backend API (`src/app/api/update-trends/route.ts`):**
   - Create a new Next.js POST endpoint.
   - This endpoint will invoke the Apify API (using `apify-client` or simple fetch) to run the `apify/facebook-pages-scraper` actor.
   - It will poll/wait for the actor to finish, fetch the resulting dataset, and overwrite the local `data/apify_fb_posts.json` file.
   - Return a success response to the client.

3. **Client State (`src/hooks/useTrendPlanner.ts`):**
   - Add a new action `updateTrendData()` that calls the new API.
   - Manage separate loading states or messages for "updating data" versus "generating plan".

## Trade-offs
- The user has to click two buttons if they want both fresh data and a new plan, but this guarantees that the plan generation is instant if the user is already satisfied with the recently fetched data.
- Running Apify synchronously in a Next.js API route might hit timeout limits in strict serverless environments, but since this app is designed to run locally (`npm run dev`), this is not a concern.
