# Vercel Setup and Editing Guide

This guide explains how to deploy, configure, and edit the site when hosting on Vercel.

## What This Site Uses

- Frontend: Vite + React + TypeScript
- Styling: Tailwind CSS
- Deployment target: Vercel
- Data source: Supabase
- Serverless endpoints: `api/*`

## Deploying To Vercel

1. Push the repository to GitHub.
2. In Vercel, create a new project from that Git repository.
3. Set the build settings to:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add all environment variables from `.env.example` into the Vercel project settings.
5. Deploy.

## Important Vercel Env Vars

These are the most important values to set on Vercel:

- `SITE_URL`
- `VITE_SITE_URL`
- `VITE_SITE_NAME`
- `VITE_SITE_SHORT_NAME`
- `VITE_SEO_TITLE`
- `VITE_SEO_DESCRIPTION`
- `VITE_SEO_KEYWORDS`
- `VITE_SEO_IMAGE`
- `VITE_SEO_TYPE`
- `VITE_SEO_AUTHOR`
- `VITE_APPEAL_MODE`
- `VITE_APPEAL_REDIRECT_URL`
- `APPEAL_DISCORD_WEBHOOK_URL`
- `VITE_FEATURE_*` toggles
- `VITE_DISCORD_URL`
- `VITE_PLAY_IP`
- `VITE_STATUS_URL`
- `VITE_SUPPORT_URL`
- `VITE_APPEAL_URL`

If you want the site to work exactly like the current local setup, copy the values from `.env` first, then replace any secrets with your own.

## What Can Be Edited From `.env`

The site is designed so that most visible parts can be controlled without editing code.

### Branding

- Site name
- Short name
- Theme color
- Logo and favicon URLs
- Twitter handle

### SEO

- Global SEO title
- Global SEO description
- Global SEO keywords
- Page-specific SEO for:
  - Home
  - Support
  - Appeal
- You can edit these in `.env` for defaults or in the admin panel for live overrides.

### Features

- Home hero
- Home stats
- Home features section
- Home community section
- Forums
- News
- Changelogs
- Status page
- Store
- Support
- Rules
- Wiki
- Appeal
- Discord button
- Copy IP button
- Theme toggle
- Cookie banner
- Maintenance banner

### Appeal Flow

- `VITE_APPEAL_MODE=form`
  - Shows the built-in appeal form.
  - Submissions go to `/api/appeals`.
- `VITE_APPEAL_MODE=redirect`
  - Redirects users to the URL in `VITE_APPEAL_REDIRECT_URL`.

### Maintenance Mode

- `maintenance_mode` is controlled from the admin panel and stored in Supabase.
- Public pages are blocked during maintenance.
- Login, recovery, callback, and admin routes remain accessible so a staff member can sign in and turn maintenance off.

## How To Edit The Site

### 1. Change text and branding

Edit these files if you want the default copy or layout to change:

- `src/config/siteEnv.ts`
- `src/pages/Index.tsx`
- `src/components/home/HeroSection.tsx`
- `src/components/home/FeaturesSection.tsx`
- `src/components/home/CommunitySection.tsx`

Most of the time, though, you should edit `.env` first because the site is already wired to read from it.

### 2. Change SEO

Use `.env` values first:

- `VITE_SEO_TITLE`
- `VITE_SEO_DESCRIPTION`
- `VITE_SEO_KEYWORDS`
- `VITE_PAGE_HOME_*`
- `VITE_PAGE_SUPPORT_*`
- `VITE_PAGE_APPEAL_*`

If a page still has custom copy in the file, update the page component too.

### 3. Enable or disable features

Flip the relevant `VITE_FEATURE_*` variable to `true` or `false`.

Examples:

- Disable forums: `VITE_FEATURE_FORUMS=false`
- Hide the Discord button: `VITE_FEATURE_DISCORD_BUTTON=false`
- Turn off the home stats block: `VITE_FEATURE_HERO_STATS=false`
- Use a redirect appeal portal: `VITE_APPEAL_MODE=redirect`

### 4. Change the appeal behavior

You have two choices:

- Built-in form:
  - `VITE_APPEAL_MODE=form`
  - Set `APPEAL_DISCORD_WEBHOOK_URL`
- External redirect:
  - `VITE_APPEAL_MODE=redirect`
  - Set `VITE_APPEAL_REDIRECT_URL`

The appeal form submits to the Vercel function in `api/appeals.js`.

## Editing In Practice

### Best way to make a small change

1. Find the matching env var.
2. Edit `.env`.
3. Redeploy on Vercel.

### Best way to make a layout change

1. Edit the page or component file.
2. Test locally with `npm run dev`.
3. Run `npm run build`.
4. Push and let Vercel redeploy.

### Best way to change admin behavior

1. Edit the Supabase-backed admin setting in the admin panel.
2. Use the SEO tab in the admin panel for live SEO overrides.
3. Or update the fallback/default behavior in `src/config/siteEnv.ts`.

## Local Development

1. Install dependencies with `npm install`.
2. Create or update `.env` from `.env.example`.
3. Run:

```bash
npm run dev
```

4. Open the local site URL shown by Vite.

## Build And Verify

Before pushing, run:

```bash
npm run build
```

This project uses `prebuild` to generate:

- `public/news/rss.xml`
- `public/changelogs/rss.xml`
- `public/sitemap.xml`

Production builds are also configured to avoid shipping source maps and to keep the output as compact as Vite allows without adding a separate obfuscation package.

## File Map

- `src/config/siteEnv.ts` - env-backed config helper for branding, SEO, toggles, appeal mode
- `src/pages/admin/AdminSettingsPage.tsx` - admin SEO, branding, and live site controls
- `src/App.tsx` - route gating
- `src/components/layout/MaintenanceGate.tsx` - maintenance protection
- `src/components/layout/Navbar.tsx` - top navigation
- `src/components/layout/Footer.tsx` - footer links
- `src/components/layout/Layout.tsx` - SEO and layout shell
- `src/pages/AppealPage.tsx` - appeal UI
- `api/appeals.js` - Vercel webhook endpoint
- `server.js` - local Node server version of the same endpoint

## Safety Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` private.
- Keep `APPEAL_DISCORD_WEBHOOK_URL` private.
- Do not expose server-only secrets in `VITE_*` variables.
- If maintenance mode is enabled, use the admin login or `/admin` route to turn it back off.

## Quick Edit Cheat Sheet

- Change site name: `VITE_SITE_NAME`
- Change server IP: `VITE_PLAY_IP`
- Change Discord link: `VITE_DISCORD_URL`
- Hide forums: `VITE_FEATURE_FORUMS=false`
- Change appeal to redirect: `VITE_APPEAL_MODE=redirect`
- Change appeal destination: `VITE_APPEAL_REDIRECT_URL=https://...`
- Change SEO: `VITE_SEO_*` and `VITE_PAGE_*`
- Or open the admin panel SEO tab for live overrides
- Turn on maintenance: admin panel `maintenance_mode`

## Recommended Workflow

1. Edit `.env` for config changes.
2. Edit files only when you need layout or logic changes.
3. Test locally.
4. Build.
5. Push to GitHub.
6. Let Vercel deploy.
