# Getting Started

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm (bundled with Node)

## Setup

1. Install dependencies:
   - `npm i`
2. Create your env file:
   - Copy `.env.example` → `.env`
   - Fill in the **REQUIRED ENV VARS** at the top
3. Start dev server:
   - `npm run dev`

### Windows note (PowerShell execution policy)

If you see “running scripts is disabled”, run npm through CMD:

- `cmd /c npm run dev`
- `cmd /c npm run build`

## Building

`npm run build` runs `scripts/generate-rss.js` and `scripts/generate-sitemap.js` before the Vite build.

To generate RSS + sitemap successfully, set:

- `SITE_URL`
- `VITE_SUPABASE_URL` (or `SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` (recommended; falls back to anon key but may not have access)

## Running the server (optional)

This repo includes `server.js` (Express) for API routes and SSR support.

- Start after building: `node server.js`
- Configure:
  - `PORT` (optional)
  - `SITE_URL` and `CORS_ALLOW_ORIGIN` (optional CORS tuning)
  - `SUPABASE_SERVICE_ROLE_KEY` (recommended for admin/secure routes)

