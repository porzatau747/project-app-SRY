# Project Context: Weekly Content Planner

## Overview
The Weekly Content Planner is a Monorepo application designed to automate and streamline the creation of a 7-day social media content calendar. It combines physical inventory data (stock and pricing) with real-time IT trends scraped from the web (e.g., Facebook, tech sites) to generate content prompts using Google's Gemini AI.

## Purpose
To assist the store "Advice สามร้อยยอด" (or similar IT retail stores) in planning their social media content. It automates the process of finding what's in stock, matching it with current trends, and generating creative post ideas, captions, and AI artwork prompts.

## Key Technologies
- **Frontend Framework**: Next.js (React)
- **Styling**: Vanilla CSS / Modules (or Tailwind based on setup)
- **Backend/API**: Next.js API Routes
- **State Management**: React Query, Zustand
- **Database/Storage**: File-based JSON storage (`data/planner-state.json`) and LocalStorage for UI history.
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Scraping**: Apify, Python scripts (BeautifulSoup/Playwright), and a dedicated Node.js worker (`apps/scraping-worker`)
- **Monorepo Management**: npm workspaces (implied by `apps/` and `packages/` structure)

## Core Capabilities
- **Stock Analysis**: Ingests inventory files, determines aging buckets, and calculates special pricing.
- **Trend Scraping**: Pulls recent tech news and tips to find trending topics.
- **Content Generation**: Uses AI to blend stock items with current trends to formulate engaging posts.
- **History Management**: Keeps track of generated campaign plans locally.
