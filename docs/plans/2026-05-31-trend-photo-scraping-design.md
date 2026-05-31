# Trend Planner: Photo Scraping Strategy Design

## Overview
Change the data scraping logic for the Trend Planner to ensure it fetches exactly 5 of the latest *photo* posts from 4 specific Facebook IT pages (Comcraft, NotebookSpec, Techhub, OverclockZone).

## Data Sources
We will scrape the main feeds (not `/photos` to avoid DOM traversal performance issues) of:
1. https://www.facebook.com/comcraft.ds
2. https://www.facebook.com/notebookspec
3. https://www.facebook.com/techhub.arip
4. https://www.facebook.com/overclockzonefanpage

## Architecture & Extraction Logic
- **Puppeteer Script (`apps/web-app/src/app/api/update-trends/route.ts`)**: 
  - Add `techhub.arip` back to the `FB_PAGES` array.
  - The DOM query `querySelectorAll('img')` already exists, but we will ensure it rejects videos (`video` tag).
  - Modify the grouping logic to slice `(0, 5)` instead of `(0, 4)` so that it takes the top 5 relevant posts per page.
- **Frontend**: The `TrendPlannerApp` and `NewsAndTipsList` will automatically handle up to 20 posts (4 pages x 5 posts) without changes.

## Error Handling
- If a page has fewer than 5 photo posts in the immediate viewport (unlikely for news pages), it will gracefully return whatever photo posts it can find.
- AI filtering will remain lenient to ensure we don't drop valid posts.
