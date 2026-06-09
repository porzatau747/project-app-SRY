# AI Agent Task Template

When assigning a new task to an AI agent in this project, use the following template to ensure the agent has all the necessary context.

---

## 🎯 Objective
[State the exact goal of this task. E.g., "Add a new API route to export the weekly plan as a CSV file."]

## 📂 Relevant Files
[List the files the agent should look at first.]
- `apps/web-app/src/app/api/export-csv/route.ts` (To be created)
- `apps/web-app/src/utils/exportUtils.ts`
- `apps/web-app/src/services/storage.ts`

## 🧩 Context & Constraints
- **Architecture**: Remember this is a Next.js App Router project. Use standard web response objects.
- **Storage**: Do not use a database connection. Read data from `data/planner-state.json` via `services/storage.ts`.
- **AI Service**: If updating prompts, ensure you use the `getClient()` factory from `src/services/ai.ts`.
- **Safety**: Do not execute destructive commands unless explicitly requested by the user.

## ✅ Acceptance Criteria
- [ ] A new API endpoint is accessible at `/api/export-csv`.
- [ ] The endpoint reads the current state and formats it into a valid CSV.
- [ ] No existing code is broken or reformatted unnecessarily.
- [ ] The feature is verified by testing the endpoint locally.

---
