# StudentOS

All-in-one AI-powered career platform for students: CV & ATS checker, scholarship finder,
job board, plagiarism checker, learning plans, habit tracker, and more.

## Project layout

- `/` — React 19 + Vite + TypeScript frontend
- `/backend` — Express + Prisma API server
- `/telegram-bot` — Telegram bot companion

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`, and `VITE_GOOGLE_CLIENT_ID`
3. Start the dev server: `npm run dev`

For the backend, see `backend/.env.example` and run `npm run dev` inside `backend/`.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway/Docker instructions.
